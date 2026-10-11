"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { can, requireUser } from "@/lib/auth";
import { humanize } from "@/lib/utils";
import { logActivity } from "@/lib/services/activity";
import { notify } from "@/lib/services/notifications";
import { nextRequestReference } from "@/lib/services/reference";
import { isAllowedImageUrl } from "@/lib/services/storage";
import {
  assignSchema,
  commentSchema,
  createRequestSchema,
  prioritySchema,
  scheduleSchema,
  statusSchema,
} from "@/lib/validations/request";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function loadRequestForActor(requestId: string) {
  return prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      property: { select: { id: true, name: true, managerId: true } },
      unit: { select: { label: true } },
      tenant: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true } },
    },
  });
}

/* --------------------------------- create --------------------------------- */
export async function createRequest(
  _prev: ActionResult<{ id: string; reference: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string; reference: string }>> {
  const user = await requireUser();
  if (!can(user, "request.create")) {
    return { ok: false, error: "You can't create requests." };
  }

  const attachments = formData
    .getAll("attachments")
    .map(String)
    .filter((u) => u && isAllowedImageUrl(u));

  const parsed = createRequestSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    priority: formData.get("priority"),
    propertyId: formData.get("propertyId"),
    unitId: formData.get("unitId") || undefined,
    preferredAccess: formData.get("preferredAccess") || undefined,
    attachments,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const input = parsed.data;

  // Tenants can only file against their own unit.
  let unitId = input.unitId || null;
  let propertyId = input.propertyId;
  if (user.role === "TENANT") {
    if (!user.unitId) {
      return {
        ok: false,
        error: "Your account isn't linked to a unit yet. Contact your manager.",
      };
    }
    unitId = user.unitId;
    propertyId = user.unit?.propertyId ?? propertyId;
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, name: true, managerId: true },
  });
  if (!property) return { ok: false, error: "That property no longer exists." };

  const reference = await nextRequestReference();

  const request = await prisma.maintenanceRequest.create({
    data: {
      reference,
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      priority: input.priority,
      status: "SUBMITTED",
      propertyId: property.id,
      unitId,
      tenantId: user.id,
      preferredAccess: input.preferredAccess || null,
      attachments: attachments.length
        ? { create: attachments.map((url) => ({ url, kind: "issue" })) }
        : undefined,
      comments: {
        create: {
          system: true,
          authorId: user.id,
          body: `Request submitted by ${user.name}`,
        },
      },
    },
  });

  await logActivity({
    actorId: user.id,
    action: "request.created",
    summary: `${user.name} submitted "${input.title}" · ${reference}`,
    entity: "MaintenanceRequest",
    entityId: request.id,
    requestId: request.id,
  });

  if (property.managerId) {
    await notify({
      userId: property.managerId,
      type: input.priority === "EMERGENCY" ? "EMERGENCY" : "REQUEST_CREATED",
      title:
        input.priority === "EMERGENCY"
          ? "Emergency request reported"
          : `New request · ${reference}`,
      body: `${input.title} at ${property.name}.`,
      requestId: request.id,
    });
  }

  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: request.id, reference } };
}

/* --------------------------------- comment -------------------------------- */
export async function addComment(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = commentSchema.safeParse({
    requestId: formData.get("requestId"),
    body: formData.get("body"),
    internal: formData.get("internal") === "on" || formData.get("internal") === "true",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  const request = await loadRequestForActor(parsed.data.requestId);
  if (!request) return { ok: false, error: "Request not found." };

  // Access check
  const allowed =
    user.role === "ADMIN" ||
    user.role === "MANAGER" ||
    request.tenantId === user.id ||
    request.technicianId === user.id;
  if (!allowed) return { ok: false, error: "You can't comment on this request." };

  const internal = parsed.data.internal && user.role !== "TENANT";

  await prisma.requestComment.create({
    data: {
      requestId: request.id,
      authorId: user.id,
      body: parsed.data.body,
      internal,
    },
  });

  await logActivity({
    actorId: user.id,
    action: "request.comment_added",
    summary: `${user.name} ${internal ? "added an internal note" : "commented"} on ${request.reference}`,
    entity: "MaintenanceRequest",
    entityId: request.id,
    requestId: request.id,
  });

  // Notify the "other side"
  if (!internal) {
    const recipients = new Set<string>();
    if (user.id !== request.tenantId) recipients.add(request.tenantId);
    if (request.technicianId && user.id !== request.technicianId)
      recipients.add(request.technicianId);
    if (request.property.managerId && user.id !== request.property.managerId)
      recipients.add(request.property.managerId);
    if (recipients.size) {
      await notify(
        [...recipients].map((userId) => ({
          userId,
          type: "COMMENT_ADDED" as const,
          title: `New comment on ${request.reference}`,
          body: `${user.name}: ${parsed.data.body.slice(0, 90)}`,
          requestId: request.id,
        })),
      );
    }
  }

  revalidatePath(`/dashboard/requests/${request.id}`);
  return { ok: true };
}

/* -------------------------------- assign ---------------------------------- */
export async function assignTechnician(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (!can(user, "request.assign")) {
    return { ok: false, error: "Only managers can assign technicians." };
  }
  const parsed = assignSchema.safeParse({
    requestId: formData.get("requestId"),
    technicianId: formData.get("technicianId"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const [request, tech] = await Promise.all([
    loadRequestForActor(parsed.data.requestId),
    prisma.user.findFirst({
      where: { id: parsed.data.technicianId, role: "TECHNICIAN" },
      select: { id: true, name: true },
    }),
  ]);
  if (!request) return { ok: false, error: "Request not found." };
  if (!tech) return { ok: false, error: "That technician doesn't exist." };

  const nextStatus: RequestStatus =
    request.status === "SUBMITTED" || request.status === "UNDER_REVIEW"
      ? "ASSIGNED"
      : request.status;

  await prisma.$transaction([
    prisma.maintenanceRequest.update({
      where: { id: request.id },
      data: { technicianId: tech.id, status: nextStatus },
    }),
    prisma.requestComment.create({
      data: {
        requestId: request.id,
        authorId: user.id,
        system: true,
        body: `Assigned to ${tech.name}`,
      },
    }),
  ]);

  await logActivity({
    actorId: user.id,
    action: "request.assigned",
    summary: `${user.name} assigned ${request.reference} to ${tech.name}`,
    entity: "MaintenanceRequest",
    entityId: request.id,
    requestId: request.id,
  });

  await notify([
    {
      userId: tech.id,
      type: "REQUEST_ASSIGNED",
      title: `New assignment · ${request.reference}`,
      body: `${request.title} at ${request.property.name}${
        request.unit ? `, ${request.unit.label}` : ""
      }.`,
      requestId: request.id,
    },
    {
      userId: request.tenantId,
      type: "REQUEST_ASSIGNED",
      title: "A technician is on your request",
      body: `${tech.name} has been assigned to "${request.title}".`,
      requestId: request.id,
    },
  ]);

  revalidatePath(`/dashboard/requests/${request.id}`);
  revalidatePath("/dashboard/requests");
  return { ok: true };
}

/* ------------------------------ change status ----------------------------- */
export async function changeStatus(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (!can(user, "request.changeStatus")) {
    return { ok: false, error: "You can't change this request's status." };
  }
  const parsed = statusSchema.safeParse({
    requestId: formData.get("requestId"),
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid status." };
  }

  const request = await loadRequestForActor(parsed.data.requestId);
  if (!request) return { ok: false, error: "Request not found." };
  if (user.role === "TECHNICIAN" && request.technicianId !== user.id) {
    return { ok: false, error: "This request isn't assigned to you." };
  }
  if (parsed.data.status === request.status) {
    return { ok: false, error: "That's already the current status." };
  }

  const isResolved = parsed.data.status === "RESOLVED";
  const isClosed = parsed.data.status === "CLOSED";

  await prisma.$transaction([
    prisma.maintenanceRequest.update({
      where: { id: request.id },
      data: {
        status: parsed.data.status,
        resolvedAt:
          isResolved || isClosed ? (request.resolvedAt ?? new Date()) : null,
      },
    }),
    prisma.requestComment.create({
      data: {
        requestId: request.id,
        authorId: user.id,
        system: true,
        body: `Status changed to ${humanize(parsed.data.status)}${
          parsed.data.note ? ` — ${parsed.data.note}` : ""
        }`,
      },
    }),
  ]);

  await logActivity({
    actorId: user.id,
    action: isResolved ? "request.resolved" : "request.status_changed",
    summary: `${user.name} set ${request.reference} to ${humanize(parsed.data.status)}`,
    entity: "MaintenanceRequest",
    entityId: request.id,
    requestId: request.id,
  });

  const recipients = new Set<string>([request.tenantId]);
  if (request.property.managerId) recipients.add(request.property.managerId);
  recipients.delete(user.id);
  if (recipients.size) {
    await notify(
      [...recipients].map((userId) => ({
        userId,
        type: isResolved ? ("REQUEST_RESOLVED" as const) : ("STATUS_CHANGED" as const),
        title: isResolved
          ? `Request ${request.reference} resolved`
          : `Update on ${request.reference}`,
        body: isResolved
          ? `"${request.title}" has been marked resolved.`
          : `"${request.title}" is now ${humanize(parsed.data.status).toLowerCase()}.`,
        requestId: request.id,
      })),
    );
  }

  revalidatePath(`/dashboard/requests/${request.id}`);
  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard");
  return { ok: true };
}

/* ----------------------------- change priority ---------------------------- */
export async function changePriority(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (!can(user, "request.changePriority")) {
    return { ok: false, error: "Only managers can change priority." };
  }
  const parsed = prioritySchema.safeParse({
    requestId: formData.get("requestId"),
    priority: formData.get("priority"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid priority." };
  }

  const request = await loadRequestForActor(parsed.data.requestId);
  if (!request) return { ok: false, error: "Request not found." };
  if (request.priority === parsed.data.priority) {
    return { ok: false, error: "That's already the current priority." };
  }

  await prisma.$transaction([
    prisma.maintenanceRequest.update({
      where: { id: request.id },
      data: { priority: parsed.data.priority },
    }),
    prisma.requestComment.create({
      data: {
        requestId: request.id,
        authorId: user.id,
        system: true,
        body: `Priority changed to ${humanize(parsed.data.priority)}`,
      },
    }),
  ]);

  await logActivity({
    actorId: user.id,
    action: "request.priority_changed",
    summary: `${user.name} set ${request.reference} priority to ${humanize(parsed.data.priority)}`,
    entity: "MaintenanceRequest",
    entityId: request.id,
    requestId: request.id,
  });

  if (parsed.data.priority === "EMERGENCY" && request.property.managerId) {
    await notify({
      userId: request.property.managerId,
      type: "EMERGENCY",
      title: `Escalated to emergency · ${request.reference}`,
      body: `${request.title} at ${request.property.name}.`,
      requestId: request.id,
    });
  }

  revalidatePath(`/dashboard/requests/${request.id}`);
  revalidatePath("/dashboard/requests");
  return { ok: true };
}

/* ------------------------------- schedule -------------------------------- */
export async function scheduleRequest(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (!can(user, "request.assign")) {
    return { ok: false, error: "Only managers can schedule visits." };
  }
  const parsed = scheduleSchema.safeParse({
    requestId: formData.get("requestId"),
    scheduledFor: formData.get("scheduledFor"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Pick a date." };
  }
  const when = new Date(parsed.data.scheduledFor);
  if (Number.isNaN(when.getTime())) {
    return { ok: false, error: "That date doesn't look right." };
  }

  const request = await loadRequestForActor(parsed.data.requestId);
  if (!request) return { ok: false, error: "Request not found." };

  await prisma.maintenanceRequest.update({
    where: { id: request.id },
    data: { scheduledFor: when },
  });
  await prisma.requestComment.create({
    data: {
      requestId: request.id,
      authorId: user.id,
      system: true,
      body: `Visit scheduled for ${when.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })}`,
    },
  });
  await logActivity({
    actorId: user.id,
    action: "request.scheduled",
    summary: `${user.name} scheduled ${request.reference}`,
    entity: "MaintenanceRequest",
    entityId: request.id,
    requestId: request.id,
  });

  const targets = new Set<string>([request.tenantId]);
  if (request.technicianId) targets.add(request.technicianId);
  targets.delete(user.id);
  if (targets.size) {
    await notify(
      [...targets].map((userId) => ({
        userId,
        type: "STATUS_CHANGED" as const,
        title: `Visit scheduled · ${request.reference}`,
        body: `${request.title} — ${when.toLocaleDateString("en-US", {
          dateStyle: "medium",
        })}.`,
        requestId: request.id,
      })),
    );
  }

  revalidatePath(`/dashboard/requests/${request.id}`);
  revalidatePath("/dashboard/calendar");
  return { ok: true };
}

/* -------------------------- completion attachment ------------------------- */
export async function addCompletionPhoto(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const requestId = String(formData.get("requestId"));
  const url = String(formData.get("url"));
  if (!isAllowedImageUrl(url)) {
    return { ok: false, error: "Choose one of the sample completion photos." };
  }
  const request = await loadRequestForActor(requestId);
  if (!request) return { ok: false, error: "Request not found." };
  if (
    user.role === "TENANT" ||
    (user.role === "TECHNICIAN" && request.technicianId !== user.id)
  ) {
    return { ok: false, error: "You can't attach completion photos here." };
  }

  await prisma.requestAttachment.create({
    data: { requestId, url, kind: "completion", caption: "Completed work" },
  });
  await logActivity({
    actorId: user.id,
    action: "request.completion_photo",
    summary: `${user.name} added a completion photo to ${request.reference}`,
    entity: "MaintenanceRequest",
    entityId: requestId,
    requestId,
  });
  revalidatePath(`/dashboard/requests/${requestId}`);
  return { ok: true };
}

/* --------------------------- redirect-after-create ---------------------------- */
export async function goToRequest(id: string) {
  redirect(`/dashboard/requests/${id}`);
}

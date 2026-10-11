import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Clock,
  DoorOpen,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import type { getRequestDetail } from "@/lib/queries/requests";
import type { SessionUser } from "@/lib/auth";
import { can } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { SmartImage } from "@/components/smart-image";
import { RequestActions } from "@/components/dashboard/request-actions";
import { CommentForm } from "@/components/dashboard/comment-form";
import { CompletionPhoto } from "@/components/dashboard/completion-photo";
import { RequestTimeline } from "@/components/dashboard/request-timeline";
import { formatDate, formatDateTime, initials } from "@/lib/utils";

type Request = NonNullable<Awaited<ReturnType<typeof getRequestDetail>>>;
type Technician = { id: string; name: string; specialization?: string | null };

export function RequestDetail({
  request,
  viewer,
  technicians,
}: {
  request: Request;
  viewer: SessionUser;
  technicians: Technician[];
}) {
  const isTenant = viewer.role === "TENANT";
  const canSeeInternal = !isTenant;
  const issuePhotos = request.attachments.filter((a) => a.kind === "issue");
  const completionPhotos = request.attachments.filter((a) => a.kind === "completion");

  const showActions =
    can(viewer, "request.assign") ||
    can(viewer, "request.changeStatus") ||
    can(viewer, "request.changePriority");
  const isAssignedTech =
    viewer.role === "TECHNICIAN" && request.technicianId === viewer.id;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/requests"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All requests
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {request.reference}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {request.category.name}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {request.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" /> Opened {formatDate(request.createdAt)}
            </span>
            {request.resolvedAt && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                Resolved {formatDate(request.resolvedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {request.description}
              </p>
              {request.preferredAccess && (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs">
                  <DoorOpen className="size-3.5" />
                  Preferred access: {request.preferredAccess}
                </p>
              )}
            </CardContent>
          </Card>

          {issuePhotos.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Issue photos</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {issuePhotos.map((a) => (
                    <div
                      key={a.id}
                      className="relative aspect-video overflow-hidden rounded-lg border"
                    >
                      <SmartImage
                        src={a.url}
                        alt={a.caption ?? "Issue photo"}
                        fill
                        sizes="(max-width: 640px) 50vw, 200px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {completionPhotos.length > 0 && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-emerald-700 dark:text-emerald-300">
                  Completion photos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {completionPhotos.map((a) => (
                    <div
                      key={a.id}
                      className="relative aspect-video overflow-hidden rounded-lg border"
                    >
                      <SmartImage
                        src={a.url}
                        alt="Completed work"
                        fill
                        sizes="(max-width: 640px) 50vw, 200px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Activity &amp; comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <RequestTimeline
                comments={request.comments}
                showInternal={canSeeInternal}
              />
              <div className="border-t pt-4">
                <CommentForm
                  requestId={request.id}
                  canInternal={canSeeInternal}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {(showActions || isAssignedTech) && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {showActions && (
                  <RequestActions
                    requestId={request.id}
                    status={request.status}
                    priority={request.priority}
                    technicianId={request.technicianId}
                    technicians={technicians}
                    canAssign={can(viewer, "request.assign")}
                    canPriority={can(viewer, "request.changePriority")}
                    canStatus={can(viewer, "request.changeStatus")}
                  />
                )}
                {isAssignedTech && (
                  <div className="mt-2 space-y-2">
                    {!showActions && (
                      <RequestActions
                        requestId={request.id}
                        status={request.status}
                        priority={request.priority}
                        technicianId={request.technicianId}
                        technicians={technicians}
                        canAssign={false}
                        canPriority={false}
                        canStatus
                      />
                    )}
                    <CompletionPhoto requestId={request.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-sm">
              <DetailRow icon={Building2} label="Property">
                <Link
                  href={`/dashboard/properties/${request.property.id}`}
                  className="font-medium hover:underline"
                >
                  {request.property.name}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {request.unit ? `${request.unit.label} · ` : ""}
                  {request.property.city}, {request.property.state}
                </span>
              </DetailRow>

              <DetailRow icon={User} label="Tenant">
                {isTenant ? (
                  <span className="font-medium">{request.tenant.name}</span>
                ) : (
                  <Link
                    href={`/dashboard/tenants/${request.tenant.id}`}
                    className="font-medium hover:underline"
                  >
                    {request.tenant.name}
                  </Link>
                )}
                <span className="mt-0.5 block space-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" /> {request.tenant.email}
                  </span>
                  {request.tenant.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" /> {request.tenant.phone}
                    </span>
                  )}
                </span>
              </DetailRow>

              <DetailRow icon={User} label="Technician">
                {request.technician ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      {request.technician.avatarUrl && (
                        <AvatarImage
                          src={request.technician.avatarUrl}
                          alt={request.technician.name}
                        />
                      )}
                      <AvatarFallback>
                        {initials(request.technician.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">
                        {request.technician.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {request.technician.technicianProfile?.specialization ??
                          "Technician"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not yet assigned</span>
                )}
              </DetailRow>

              {request.scheduledFor && (
                <DetailRow icon={CalendarClock} label="Scheduled">
                  <span className="font-medium">
                    {formatDateTime(request.scheduledFor)}
                  </span>
                </DetailRow>
              )}

              {!isTenant && request.property.manager && (
                <DetailRow icon={MapPin} label="Property manager">
                  <span className="font-medium">
                    {request.property.manager.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {request.property.manager.email}
                  </span>
                </DetailRow>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: IconCmp,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <IconCmp className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

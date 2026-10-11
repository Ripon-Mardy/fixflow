import {
  PrismaClient,
  type RequestPriority,
  type RequestStatus,
  type Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  FIRST_NAMES,
  HUMAN_COMMENTS,
  INTERNAL_NOTES,
  ISSUE_TEMPLATES,
  LAST_NAMES,
  PROPERTIES,
  TECH_AVATARS,
  TECHNICIAN_SPECIALIZATIONS,
} from "./seed-data";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "Demo123!";

/* --------------------------- deterministic RNG --------------------------- */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260909);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const pickN = <T>(arr: readonly T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
};
const chance = (p: number) => rand() < p;
const int = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;
const daysAgo = (d: number, jitterHours = 0) =>
  new Date(Date.now() - d * 86400000 - int(0, jitterHours) * 3600000);
const addHours = (date: Date, h: number) =>
  new Date(date.getTime() + h * 3600000);

const usedNames = new Set<string>();
function uniqueName() {
  for (let i = 0; i < 200; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${usedNames.size}`;
}
const emailFrom = (name: string, domain: string, i: number) =>
  `${name.toLowerCase().replace(/[^a-z]+/g, ".")}${i}@${domain}`;

/* -------------------------------- status flow ------------------------------- */
const STATUS_FLOW: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

async function main() {
  console.log("→ Resetting database…");
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.requestAttachment.deleteMany();
  await prisma.requestComment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  /* ------------------------------- categories ------------------------------- */
  console.log("→ Categories");
  const categoryDefs = [
    { name: "Plumbing", slug: "plumbing", icon: "droplets" },
    { name: "Electrical", slug: "electrical", icon: "zap" },
    { name: "HVAC", slug: "hvac", icon: "wind" },
    { name: "Appliance", slug: "appliance", icon: "washing-machine" },
    { name: "Structural", slug: "structural", icon: "hammer" },
    { name: "Cleaning", slug: "cleaning", icon: "sparkles" },
    { name: "Security", slug: "security", icon: "shield" },
    { name: "Other", slug: "other", icon: "wrench" },
  ];
  const categories = await Promise.all(
    categoryDefs.map((c) =>
      prisma.category.create({ data: { ...c, enabled: true } }),
    ),
  );
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  /* --------------------------------- users --------------------------------- */
  console.log("→ Users (admin, managers, technicians, tenants)");

  const admin = await prisma.user.create({
    data: {
      email: "admin@fixflow.demo",
      name: "Jordan Avery",
      passwordHash,
      role: "ADMIN",
      phone: "+1 (503) 555-0102",
      avatarUrl:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=256&q=70",
      createdAt: daysAgo(320),
    },
  });

  // Managers — first one is the demo account "Alex Morgan"
  const managerSeed = [
    {
      name: "Alex Morgan",
      email: "manager@fixflow.demo",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=70",
    },
    {
      name: "Sarah Mitchell",
      email: "sarah.mitchell@fixflow.demo",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=70",
    },
    {
      name: "David Whitfield",
      email: "david.whitfield@fixflow.demo",
      avatarUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=70",
    },
  ];
  const managers = await Promise.all(
    managerSeed.map((m, i) =>
      prisma.user.create({
        data: {
          email: m.email,
          name: m.name,
          passwordHash,
          role: "MANAGER" as Role,
          phone: `+1 (503) 555-01${20 + i}`,
          avatarUrl: m.avatarUrl,
          createdAt: daysAgo(300 - i * 10),
        },
      }),
    ),
  );

  // Technicians — first is demo account "Mike Johnson"
  const techNameSeed = [
    "Mike Johnson",
    "Elena Petrova",
    "Marcus Freeman",
    "Priya Nair",
    "Tom Callahan",
    "Aisha Hassan",
    "Diego Delgado",
    "Nina Kowalski",
  ];
  const technicians = [];
  for (let i = 0; i < 8; i++) {
    const name = techNameSeed[i];
    usedNames.add(name);
    const spec = TECHNICIAN_SPECIALIZATIONS[i];
    const user = await prisma.user.create({
      data: {
        email: i === 0 ? "technician@fixflow.demo" : emailFrom(name, "fixflow.demo", i),
        name,
        passwordHash,
        role: "TECHNICIAN",
        phone: `+1 (503) 555-02${10 + i}`,
        avatarUrl: TECH_AVATARS[i],
        createdAt: daysAgo(280 - i * 8),
        technicianProfile: {
          create: {
            specialization: spec,
            availability: chance(0.75)
              ? "AVAILABLE"
              : chance(0.5)
                ? "BUSY"
                : "OFF_DUTY",
            rating: Math.round((3.9 + rand() * 1.1) * 10) / 10,
            avgResolutionHours: Math.round((16 + rand() * 40) * 10) / 10,
            completedJobs: int(40, 210),
            bio: `${spec} specialist with ${int(3, 18)} years in residential property maintenance.`,
          },
        },
      },
      include: { technicianProfile: true },
    });
    technicians.push(user);
  }

  /* ------------------------------ properties ------------------------------ */
  console.log("→ Properties & units");
  const properties = [];
  for (let i = 0; i < PROPERTIES.length; i++) {
    const p = PROPERTIES[i];
    const manager = managers[i % managers.length];
    const unitCount = [12, 8, 14, 6, 9, 10][i]; // total = 59
    const property = await prisma.property.create({
      data: {
        ...p,
        managerId: manager.id,
        createdAt: daysAgo(260 - i * 12),
        units: {
          create: Array.from({ length: unitCount }).map((_, u) => {
            const floor = Math.floor(u / 4) + 1;
            const letter = String.fromCharCode(65 + (u % 4));
            return {
              label: `Unit ${floor}${letter}`,
              bedrooms: pick([0, 1, 1, 2, 2, 3]),
              bathrooms: pick([1, 1, 2]),
              floor,
            };
          }),
        },
      },
      include: { units: true },
    });
    properties.push(property);
  }

  const allUnits = properties.flatMap((p) =>
    p.units.map((u) => ({ ...u, property: p })),
  );
  console.log(`   ${allUnits.length} units created`);

  /* -------------------------------- tenants -------------------------------- */
  console.log("→ Tenants");
  const tenants = [];
  const occupiedUnits = pickN(allUnits, 35);
  for (let i = 0; i < 35; i++) {
    const name = i === 0 ? "Rachel Bennett" : uniqueName();
    const unit = occupiedUnits[i];
    const tenant = await prisma.user.create({
      data: {
        email: i === 0 ? "tenant@fixflow.demo" : emailFrom(name, "example.com", i),
        name,
        passwordHash,
        role: "TENANT",
        phone: `+1 (503) 555-0${300 + i}`,
        unitId: unit.id,
        createdAt: daysAgo(240 - i * 5, 12),
      },
    });
    tenants.push({ ...tenant, unit });
  }
  // Demo tenant should sit in Riverside Apartments unit 1A for a clean story.
  const riverside = properties[0];
  await prisma.user.update({
    where: { email: "tenant@fixflow.demo" },
    data: { unitId: riverside.units[0].id },
  });
  tenants[0].unit = { ...riverside.units[0], property: riverside };

  /* --------------------------- maintenance requests --------------------------- */
  console.log("→ Maintenance requests, comments, timeline & notifications");
  const categorySlugs = Object.keys(ISSUE_TEMPLATES);
  let refSeq = 1000;
  const yearRef = new Date().getFullYear();

  const REQUEST_COUNT = 64;
  let commentCount = 0;
  let activityCount = 0;
  let notificationCount = 0;

  for (let i = 0; i < REQUEST_COUNT; i++) {
    const tenant = pick(tenants);
    const unit = tenant.unit;
    const property = unit.property;
    const manager =
      properties.find((p) => p.id === property.id)?.managerId ?? managers[0].id;

    const slug = pick(categorySlugs);
    const template = pick(ISSUE_TEMPLATES[slug]);
    const category = categoryBySlug[slug];

    // Weighted priority — most requests medium/low, few emergencies.
    const priority: RequestPriority = chance(0.08)
      ? "EMERGENCY"
      : chance(0.25)
        ? "HIGH"
        : chance(0.6)
          ? "MEDIUM"
          : "LOW";

    // Age & lifecycle
    const ageDays = int(0, 115);
    const createdAt = daysAgo(ageDays, 20);

    // Determine final status based on age
    let statusIndex: number;
    if (ageDays < 2) statusIndex = int(0, 2);
    else if (ageDays < 6) statusIndex = int(1, 3);
    else if (ageDays < 20) statusIndex = int(2, 5);
    else statusIndex = chance(0.85) ? int(4, 5) : int(2, 3);
    if (priority === "EMERGENCY" && ageDays > 3) statusIndex = Math.max(statusIndex, 4);

    let status = STATUS_FLOW[statusIndex];
    // Occasionally park a request in a side-state
    if (status === "IN_PROGRESS" && chance(0.18)) status = "WAITING_FOR_PARTS";

    const assigned = statusIndex >= 2;
    const technician = assigned
      ? pick(
          technicians.filter((t) =>
            t.technicianProfile?.specialization
              .toLowerCase()
              .includes(slug === "other" ? "" : slug.slice(0, 4)),
          ).length
            ? technicians.filter((t) =>
                t.technicianProfile?.specialization
                  .toLowerCase()
                  .includes(slug === "other" ? "" : slug.slice(0, 4)),
              )
            : technicians,
        )
      : null;

    const resolved = status === "RESOLVED" || status === "CLOSED";
    const resolvedAt = resolved ? addHours(createdAt, int(5, 90)) : null;
    const scheduledFor =
      assigned && !resolved && chance(0.5)
        ? addHours(new Date(), int(-48, 120))
        : resolved
          ? addHours(createdAt, int(3, 40))
          : null;

    const reference = `FX-${yearRef}-${++refSeq}`;

    const request = await prisma.maintenanceRequest.create({
      data: {
        reference,
        title: template.title,
        description: template.description,
        priority,
        status,
        preferredAccess: pick([
          "Weekday mornings before 11am",
          "Any weekday afternoon",
          "After 5pm on weekdays",
          "Saturday mornings",
          "Call ahead, flexible",
        ]),
        categoryId: category.id,
        propertyId: property.id,
        unitId: unit.id,
        tenantId: tenant.id,
        technicianId: technician?.id ?? null,
        createdAt,
        updatedAt: resolvedAt ?? createdAt,
        resolvedAt,
        scheduledFor,
      },
    });

    /* ---- attachments ---- */
    if (chance(0.55)) {
      const photos = pickN(
        [
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=70",
          "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=70",
          "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=70",
          "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=70",
        ],
        int(1, 2),
      );
      await prisma.requestAttachment.createMany({
        data: photos.map((url) => ({
          requestId: request.id,
          url,
          kind: "issue",
          caption: "Photo from tenant",
        })),
      });
    }
    if (resolved && chance(0.6)) {
      await prisma.requestAttachment.create({
        data: {
          requestId: request.id,
          url: "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?auto=format&fit=crop&w=1200&q=70",
          kind: "completion",
          caption: "Completed work",
        },
      });
    }

    /* ---- timeline (system comments) + activity log ---- */
    const timeline: { at: Date; body: string; action: string; actorId: string }[] =
      [];
    timeline.push({
      at: createdAt,
      body: `Request submitted by ${tenant.name}`,
      action: "request.created",
      actorId: tenant.id,
    });
    if (statusIndex >= 1)
      timeline.push({
        at: addHours(createdAt, int(1, 6)),
        body: "Manager reviewed the request",
        action: "request.reviewed",
        actorId: manager,
      });
    if (assigned && technician)
      timeline.push({
        at: addHours(createdAt, int(3, 12)),
        body: `Assigned to ${technician.name}`,
        action: "request.assigned",
        actorId: manager,
      });
    if (statusIndex >= 3 && technician)
      timeline.push({
        at: addHours(createdAt, int(6, 30)),
        body: "Technician started work on site",
        action: "request.status_changed",
        actorId: technician.id,
      });
    if (status === "WAITING_FOR_PARTS" && technician)
      timeline.push({
        at: addHours(createdAt, int(8, 36)),
        body: "Marked as waiting for parts — replacement ordered",
        action: "request.status_changed",
        actorId: technician.id,
      });
    if (resolved && technician && resolvedAt)
      timeline.push({
        at: resolvedAt,
        body: "Issue resolved and verified with tenant",
        action: "request.resolved",
        actorId: technician.id,
      });
    if (status === "CLOSED" && resolvedAt)
      timeline.push({
        at: addHours(resolvedAt, int(12, 72)),
        body: "Request closed",
        action: "request.closed",
        actorId: manager,
      });

    for (const t of timeline) {
      await prisma.requestComment.create({
        data: {
          requestId: request.id,
          authorId: t.actorId,
          body: t.body,
          system: true,
          createdAt: t.at,
        },
      });
      commentCount++;
      await prisma.activityLog.create({
        data: {
          actorId: t.actorId,
          action: t.action,
          summary: `${t.body} · ${reference}`,
          entity: "MaintenanceRequest",
          entityId: request.id,
          requestId: request.id,
          ipAddress: `10.0.${int(0, 4)}.${int(2, 240)}`,
          createdAt: t.at,
        },
      });
      activityCount++;
    }

    /* ---- human comments ---- */
    const humanComments = int(0, 3);
    for (let c = 0; c < humanComments; c++) {
      const fromTenant = chance(0.6);
      await prisma.requestComment.create({
        data: {
          requestId: request.id,
          authorId: fromTenant ? tenant.id : (technician?.id ?? manager),
          body: pick(HUMAN_COMMENTS),
          createdAt: addHours(createdAt, int(2, Math.max(3, ageDays * 12))),
        },
      });
      commentCount++;
    }
    if (assigned && chance(0.4)) {
      await prisma.requestComment.create({
        data: {
          requestId: request.id,
          authorId: manager,
          body: pick(INTERNAL_NOTES),
          internal: true,
          createdAt: addHours(createdAt, int(2, 20)),
        },
      });
      commentCount++;
    }

    /* ---- notifications ---- */
    const notes: {
      userId: string;
      type: import("@prisma/client").NotificationType;
      title: string;
      body: string;
    }[] = [];
    if (priority === "EMERGENCY") {
      notes.push({
        userId: manager,
        type: "EMERGENCY",
        title: "Emergency request reported",
        body: `${template.title} at ${property.name}.`,
      });
    }
    if (assigned && technician) {
      notes.push({
        userId: technician.id,
        type: "REQUEST_ASSIGNED",
        title: `New assignment · ${reference}`,
        body: `${template.title} at ${property.name}, ${unit.label}.`,
      });
    }
    if (resolved) {
      notes.push({
        userId: manager,
        type: "REQUEST_RESOLVED",
        title: `Request ${reference} resolved`,
        body: `${technician?.name ?? "A technician"} marked "${template.title}" as resolved.`,
      });
      notes.push({
        userId: tenant.id,
        type: "STATUS_CHANGED",
        title: "Your request was resolved",
        body: `"${template.title}" has been marked resolved. Let us know if the issue returns.`,
      });
    } else if (assigned) {
      notes.push({
        userId: tenant.id,
        type: "STATUS_CHANGED",
        title: "Update on your request",
        body: `"${template.title}" is now ${status.replace(/_/g, " ").toLowerCase()}.`,
      });
    }
    if (notes.length) {
      await prisma.notification.createMany({
        data: notes.map((n) => ({
          ...n,
          requestId: request.id,
          read: chance(0.35),
          createdAt: resolvedAt ?? addHours(createdAt, int(1, 10)),
        })),
      });
      notificationCount += notes.length;
    }
  }

  /* ---- a few unread "attention" notifications for the demo manager ---- */
  const openEmergencies = await prisma.maintenanceRequest.findMany({
    where: { priority: "EMERGENCY", status: { notIn: ["RESOLVED", "CLOSED"] } },
    take: 3,
    include: { property: true },
  });
  for (const r of openEmergencies) {
    await prisma.notification.create({
      data: {
        userId: managers[0].id,
        type: "UPDATE_REQUESTED",
        title: "Tenant requested an update",
        body: `Tenant is asking for a status update on ${r.reference} at ${r.property.name}.`,
        requestId: r.id,
        read: false,
      },
    });
    notificationCount++;
  }

  /* ---- account-level activity log entries ---- */
  await prisma.activityLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "user.created",
        summary: `Admin created manager account for ${managers[2].name}`,
        entity: "User",
        entityId: managers[2].id,
        ipAddress: "10.0.0.4",
        createdAt: daysAgo(120),
      },
      {
        actorId: managers[0].id,
        action: "property.created",
        summary: `Manager added property ${properties[5].name}`,
        entity: "Property",
        entityId: properties[5].id,
        ipAddress: "10.0.1.22",
        createdAt: daysAgo(90),
      },
      {
        actorId: admin.id,
        action: "category.updated",
        summary: 'Admin renamed category to "Appliance"',
        entity: "Category",
        entityId: categoryBySlug.appliance.id,
        ipAddress: "10.0.0.4",
        createdAt: daysAgo(60),
      },
    ],
  });
  activityCount += 3;

  console.log("\n✔ Seed complete");
  console.table({
    users: 1 + managers.length + technicians.length + tenants.length,
    properties: properties.length,
    units: allUnits.length,
    requests: REQUEST_COUNT,
    comments: commentCount,
    activityLogs: activityCount,
    notifications: notificationCount,
    categories: categories.length,
  });
  console.log(`\nDemo login — password for every account: ${DEMO_PASSWORD}`);
  console.log("  admin@fixflow.demo · manager@fixflow.demo · technician@fixflow.demo · tenant@fixflow.demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

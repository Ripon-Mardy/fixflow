import type { Role } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles?: Role[];
  exact?: boolean;
};

export const DASHBOARD_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    exact: true,
  },
  { href: "/dashboard/requests", label: "Requests", icon: "ClipboardList" },
  {
    href: "/dashboard/requests/new",
    label: "New request",
    icon: "Plus",
    roles: ["TENANT"],
  },
  {
    href: "/dashboard/properties",
    label: "Properties",
    icon: "Building2",
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/dashboard/tenants",
    label: "Tenants",
    icon: "Users",
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/dashboard/technicians",
    label: "Technicians",
    icon: "Wrench",
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/dashboard/calendar",
    label: "Calendar",
    icon: "CalendarDays",
    roles: ["MANAGER", "ADMIN", "TECHNICIAN"],
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: "BarChart3",
    roles: ["MANAGER", "ADMIN"],
  },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard", exact: true },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/admin/properties", label: "Properties", icon: "Building2" },
  { href: "/admin/requests", label: "Requests", icon: "ClipboardList" },
  { href: "/admin/technicians", label: "Technicians", icon: "Wrench" },
  { href: "/admin/categories", label: "Categories", icon: "Tags" },
  { href: "/admin/activity", label: "Activity Logs", icon: "ScrollText" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
];

export function navForRole(items: NavItem[], role: Role) {
  return items.filter((i) => !i.roles || i.roles.includes(role));
}

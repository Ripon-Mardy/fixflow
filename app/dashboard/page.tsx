import { requireUser } from "@/lib/auth";
import {
  getManagerDashboard,
  getTechnicianDashboard,
  getTenantDashboard,
} from "@/lib/queries/dashboard";
import { ManagerDashboard } from "@/components/dashboard/views/manager-dashboard";
import { TechnicianDashboard } from "@/components/dashboard/views/technician-dashboard";
import { TenantDashboard } from "@/components/dashboard/views/tenant-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  if (user.role === "TECHNICIAN") {
    const data = await getTechnicianDashboard(user);
    return <TechnicianDashboard firstName={firstName} data={data} />;
  }

  if (user.role === "TENANT") {
    const data = await getTenantDashboard(user);
    return <TenantDashboard user={user} data={data} />;
  }

  const data = await getManagerDashboard(user);
  return <ManagerDashboard firstName={firstName} data={data} />;
}

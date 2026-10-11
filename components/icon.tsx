import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Plus,
  ScrollText,
  Settings,
  Tags,
  Users,
  Wrench,
  type LucideProps,
} from "lucide-react";

const MAP = {
  LayoutDashboard,
  ClipboardList,
  Plus,
  Building2,
  Users,
  Wrench,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  Tags,
  ScrollText,
} as const;

export type IconName = keyof typeof MAP;

export function Icon({
  name,
  ...props
}: { name: IconName } & LucideProps) {
  const Cmp = MAP[name];
  return Cmp ? <Cmp {...props} /> : null;
}

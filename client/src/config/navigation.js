import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Gauge,
  KanbanSquare,
  MessagesSquare,
  Settings,
  ShieldCheck,
  Target,
  UsersRound,
} from "lucide-react";

export const navigationItems = [
  // MAIN
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    group: "MAIN",
  },

  // CRM
  { id: "leads", label: "Leads", path: "/leads", icon: Target, group: "CRM" },
  {
    id: "customers",
    label: "Customers",
    path: "/customers",
    icon: BriefcaseBusiness,
    group: "CRM",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    path: "/campaigns",
    icon: Target,
    group: "CRM",
  },
  {
    id: "pipeline",
    label: "Pipeline",
    path: "/pipeline",
    icon: KanbanSquare,
    group: "CRM",
  },

  // OPERATIONS
  {
    id: "tasks",
    label: "Tasks",
    path: "/tasks",
    icon: Bell,
    group: "OPERATIONS",
  },
  {
    id: "communications",
    label: "Communications",
    path: "/communications",
    icon: MessagesSquare,
    group: "OPERATIONS",
  },

  // INSIGHTS
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    group: "INSIGHTS",
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    icon: Activity,
    group: "INSIGHTS",
  },

  // ADMIN
  {
    id: "users",
    label: "Users",
    path: "/users",
    icon: UsersRound,
    group: "ADMIN",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
    group: "ADMIN",
  },

  {
    id: "security",
    label: "Access",
    path: "/users",
    icon: ShieldCheck,
    hidden: true,
  },
];

export const navigationGroups = [
  "MAIN",
  "CRM",
  "OPERATIONS",
  "INSIGHTS",
  "ADMIN",
];

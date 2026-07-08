export const ROLES = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  SALES: "Sales Executive",
  SUPPORT: "Customer Support Executive",
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: "danger",
  [ROLES.MANAGER]: "primary",
  [ROLES.SALES]: "success",
  [ROLES.SUPPORT]: "warning",
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    "dashboard",
    "leads",
    "customers",
    "campaigns",
    "pipeline",
    "tasks",
    "communications",
    "reports",
    "analytics",
    "users",
    "settings",
  ],
  [ROLES.MANAGER]: [
    "dashboard",
    "leads",
    "customers",
    "campaigns",
    "pipeline",
    "tasks",
    "communications",
    "reports",
    "analytics",
    "users",
    "settings",
  ],
  [ROLES.SALES]: [
    "dashboard",
    "leads",
    "customers",
    "campaigns",
    "pipeline",
    "tasks",
    "communications",
    "analytics",
    "settings",
  ],
  [ROLES.SUPPORT]: [
    "dashboard",
    "customers",
    "campaigns",
    "tasks",
    "communications",
    "settings",
  ],
};

export function canAccess(role, moduleId) {
  return PERMISSIONS[role]?.includes(moduleId) ?? false;
}

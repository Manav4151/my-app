// src/constants/roles.ts

export type Role = "admin" | "inventory_manager" | "sales_executive";

export const ROLES = {
    ADMIN: "admin" as Role,
    INVENTORY_MANAGER: "inventory_manager" as Role,
    SALES_EXECUTIVE: "sales_executive" as Role,
};

export const ALL_ROLES: Role[] = [
    ROLES.ADMIN,
    ROLES.INVENTORY_MANAGER,
    ROLES.SALES_EXECUTIVE,
];

export const ROLE_GROUPS = {
    ADMIN_ONLY: [ROLES.ADMIN],
    BOOKS_MANAGERS: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER],
    QUOTATION_MANAGERS: [ROLES.ADMIN, ROLES.SALES_EXECUTIVE],
    ALL: Object.values(ROLES),
};
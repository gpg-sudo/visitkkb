// User Role Constants
export const USER_ROLES = {
    VISITOR: "VISITOR", // Not logged in (conceptual, not in DB)
    USER: "USER", // Regular customer
    OPERATOR: "OPERATOR", // Business owner
    AGENT: "AGENT", // Tourism agent
    GUIDE: "GUIDE", // Field guide
    ADMIN: "ADMIN", // Full system access
    CO_ADMIN: "CO_ADMIN", // Limited admin access
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Permission Checking
export const canBookActivities = (role: string | null): boolean => {
    if (!role) return false;
    const validRoles: string[] = [
        USER_ROLES.USER,
        USER_ROLES.OPERATOR,
        USER_ROLES.AGENT,
        USER_ROLES.GUIDE,
        USER_ROLES.ADMIN,
        USER_ROLES.CO_ADMIN,
    ];
    return validRoles.includes(role);
};

export const canManageContent = (role: string | null): boolean => {
    if (!role) return false;
    const validRoles: string[] = [
        USER_ROLES.OPERATOR,
        USER_ROLES.AGENT,
        USER_ROLES.ADMIN,
        USER_ROLES.CO_ADMIN,
    ];
    return validRoles.includes(role);
};

export const canAccessDashboard = (role: string | null): boolean => {
    if (!role) return false;
    const validRoles: string[] = [
        USER_ROLES.OPERATOR,
        USER_ROLES.AGENT,
        USER_ROLES.GUIDE,
        USER_ROLES.ADMIN,
        USER_ROLES.CO_ADMIN,
    ];
    return validRoles.includes(role);
};

export const isAdmin = (role: string | null): boolean => {
    if (!role) return false;
    const validRoles: string[] = [USER_ROLES.ADMIN, USER_ROLES.CO_ADMIN];
    return validRoles.includes(role);
};

export const canViewAllBookings = (role: string | null): boolean => {
    if (!role) return false;
    const validRoles: string[] = [USER_ROLES.ADMIN, USER_ROLES.CO_ADMIN];
    return validRoles.includes(role);
};

export const canManageUsers = (role: string | null): boolean => {
    return role === USER_ROLES.ADMIN;
};

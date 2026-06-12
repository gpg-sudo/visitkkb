"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
    USER_ROLES,
    type UserRole,
} from "@/lib/constants/UserRoles";

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: UserRole | UserRole[];
    redirectTo?: string;
    fallback?: React.ReactNode;
}

export function AuthGuard({
    children,
    requiredRole,
    redirectTo = "/login",
    fallback
}: AuthGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        // Check if user is authenticated
        if (!isAuthenticated) {
            router.push(redirectTo);
            return;
        }

        // Check role if specified
        if (requiredRole) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (user && !roles.includes(user.role)) {
                router.push("/"); // Redirect to home if role doesn't match
            }
        }
    }, [isAuthenticated, isLoading, user, requiredRole, redirectTo, router]);

    if (isLoading) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return fallback || null;
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (user && !roles.includes(user.role)) {
            return fallback || null;
        }
    }

    return <>{children}</>;
}

// Helper for protecting routes that require booking capability
export function BookingAuthGuard({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard
            requiredRole={[
                USER_ROLES.USER,
                USER_ROLES.OPERATOR,
                USER_ROLES.AGENT,
                USER_ROLES.GUIDE,
                USER_ROLES.ADMIN,
                USER_ROLES.CO_ADMIN,
            ]}
        >
            {children}
        </AuthGuard>
    );
}

// Helper for admin-only routes
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard
            requiredRole={[USER_ROLES.ADMIN, USER_ROLES.CO_ADMIN]}
        >
            {children}
        </AuthGuard>
    );
}

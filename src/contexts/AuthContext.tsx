"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type UserRole } from "@/lib/constants/UserRoles";

// Types
export interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    phone: string | null;
    avatar: string | null;
    country: string | null;
    language: string;
    whatsapp: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    language?: string;
    whatsapp?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "visitkkb_token";
const USER_KEY = "visitkkb_user";
const GUEST_CART_KEY = "visitkkb_guest_cart";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse stored user:", error);
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Login failed");
            }

            // Store token and user
            const { token: newToken, user: newUser } = data.data;
            localStorage.setItem(TOKEN_KEY, newToken);
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);

            // Sync guest cart to user cart if applicable
            await syncGuestCart(newToken);

            // Redirect to account page
            router.push("/account");
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
        const response = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                language: data.language ?? "en",
            }),
        });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Registration failed");
            }

            // Store token and user
            const { token: newToken, user: newUser } = result.data;
            localStorage.setItem(TOKEN_KEY, newToken);
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);

            // Sync guest cart
            await syncGuestCart(newToken);

            // Redirect to account page
            router.push("/account");
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const logout = () => {
        // Clear token and user
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        setToken(null);
        setUser(null);

        // Redirect to home
        router.push("/");
    };

    const updateUser = (data: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...data };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    // Sync guest cart to user cart on login
    const syncGuestCart = async (authToken: string) => {
        try {
            const guestCart = localStorage.getItem(GUEST_CART_KEY);
            if (!guestCart) return;

            const cartItems = JSON.parse(guestCart);
            if (!Array.isArray(cartItems) || cartItems.length === 0) return;

            // Send guest cart to backend to merge with user cart
            await fetch("/api/cart/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ guestCartItems: cartItems }),
            });

            // Clear guest cart
            localStorage.removeItem(GUEST_CART_KEY);
        } catch (error) {
            console.error("Failed to sync guest cart:", error);
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

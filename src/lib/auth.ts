import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export async function verifyToken(
  request: NextRequest,
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Check if session exists and is valid
    const session = await prisma.session.findFirst({
      where: {
        token,
        userId: decoded.userId,
        expiresAt: { gte: new Date() },
      },
    });

    if (!session) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function requireRole(
  user: AuthUser | null,
  allowedRoles: string[],
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}

export interface AuthUser {
    userId: string;
    email: string;
    role: string;
}

/**
 * Verify JWT token from Authorization header
 * @param req NextRequest object
 * @returns Decoded user data or null if invalid
 */
export function verifyAuthToken(token: string): AuthUser | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

/**
 * Sign a new JWT token
 * @param payload User data to encode
 * @returns JWT token string
 */
export function signAuthToken(payload: AuthUser): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d', // 7 days
        issuer: 'visitkkb',
    });
}

/**
 * Authentication middleware for protected API routes
 * Usage:
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const user = await requireAuth(req);
 *   if (user instanceof NextResponse) return user; // Return error
 *   // user is authenticated
 * }
 * ```
 */
export async function requireAuth(
    req: NextRequest
): Promise<AuthUser | NextResponse> {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
        return NextResponse.json(
            { success: false, error: 'No authorization header provided' },
            { status: 401 }
        );
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        return NextResponse.json(
            { success: false, error: 'No token provided' },
            { status: 401 }
        );
    }

    const user = verifyAuthToken(token);

    if (!user) {
        return NextResponse.json(
            { success: false, error: 'Invalid or expired token' },
            { status: 401 }
        );
    }

    return user;
}

/**
 * Require specific role(s) for authorization
 * Usage:
 * ```ts
 * export async function DELETE(req: NextRequest) {
 *   const user = await requireRole(req, ['ADMIN', 'MODERATOR']);
 *   if (user instanceof NextResponse) return user;
 *   // user is authenticated and authorized
 * }
 * ```
 */
export async function requireRole(
    req: NextRequest,
    allowedRoles: string[]
): Promise<AuthUser | NextResponse> {
    const user = await requireAuth(req);

    if (user instanceof NextResponse) {
        return user; // Return auth error
    }

    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
            {
                success: false,
                error: 'Insufficient permissions',
                required: allowedRoles,
                current: user.role
            },
            { status: 403 }
        );
    }

    return user;
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that behave differently for authenticated users
 */
export async function optionalAuth(
    req: NextRequest
): Promise<AuthUser | null> {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');
    return verifyAuthToken(token);
}

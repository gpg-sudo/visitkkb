import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  whatsapp: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register - User registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is login or register based on body
    if (body.name) {
      // Registration
      const validated = registerSchema.parse(body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "User already exists" },
          { status: 400 },
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validated.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: validated.email,
          password: hashedPassword,
          name: validated.name,
          phone: validated.phone,
          country: validated.country,
          language: validated.language ?? "en",
          whatsapp: validated.whatsapp,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          country: true,
          language: true,
          whatsapp: true,
          avatar: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return NextResponse.json({
        success: true,
        data: { user, token },
        message: "Registration successful",
      });
    } else {
      // Login
      const validated = loginSchema.parse(body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: validated.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          country: true,
          language: true,
          whatsapp: true,
          avatar: true,
          password: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 },
        );
      }

      // Verify password
      if (!user.password) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 },
        );
      }

      const isValidPassword = await bcrypt.compare(
        validated.password,
        user.password,
      );

      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "Invalid credentials" },
          { status: 401 },
        );
      }

      // Generate new token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            country: user.country,
            language: user.language,
            whatsapp: user.whatsapp,
            avatar: user.avatar,
          },
          token,
        },
        message: "Login successful",
      });
    }
  } catch (error) {
    console.error("Auth error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 },
    );
  }
}

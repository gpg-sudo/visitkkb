import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// GET: list all page files in public/pages (excluding extensions if needed)
export async function GET() {
  try {
    const pagesDir = path.join(process.cwd(), "public", "pages");
    const files = await fs.promises.readdir(pagesDir);
    // Return only .html files (or any) as page identifiers (filename without extension)
    const pages = files
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.replace(/\.html$/i, ""));
    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error("Error listing pages", error);
    return NextResponse.json(
      { success: false, error: "Failed to list pages" },
      { status: 500 },
    );
  }
}

// POST: create or update a page content
export async function POST(request: Request) {
  try {
    const { page, content } = await request.json();
    if (!page || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }
    const safePage = page.replace(/[^a-zA-Z0-9_-]/g, ""); // basic sanitization
    const filePath = path.join(
      process.cwd(),
      "public",
      "pages",
      `${safePage}.html`,
    );
    await fs.promises.writeFile(filePath, content, "utf8");
    return NextResponse.json({ success: true, message: "Page saved" });
  } catch (error) {
    console.error("Error saving page", error);
    return NextResponse.json(
      { success: false, error: "Failed to save page" },
      { status: 500 },
    );
  }
}

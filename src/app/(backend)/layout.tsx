import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-serif",
});

export const metadata: Metadata = {
    title: "VisitKKB Admin Suite",
    description: "Management dashboard for VisitKKB platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "min-h-screen flex flex-col font-sans antialiased bg-background text-foreground",
                    inter.variable,
                    playfair.variable,
                )}
            >
                {children}
            </body>
        </html>
    );
}

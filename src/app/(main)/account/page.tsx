"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export default function AccountPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const details = [
    { label: "Name", value: user.name || "Not set" },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
    { label: "Phone", value: user.phone || "Not provided" },
    { label: "Country", value: user.country || "Not provided" },
    { label: "Language", value: user.language },
    { label: "WhatsApp", value: user.whatsapp || "Not provided" },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto space-y-6">
            <CardHeader>
              <CardTitle>My Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage your VisitKKB profile and booking details.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {details.map((detail) => (
                  <div
                    key={detail.label}
                    className="rounded-lg border border-input p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {detail.label}
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={logout}>
                Sign out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}


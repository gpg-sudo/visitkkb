"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TripsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/activities/trips");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-muted-foreground">Redirecting to Trips & Schedule...</p>
        </div>
    );
}

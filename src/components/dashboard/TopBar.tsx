"use client";

import { Bell, Search, Menu } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

interface TopBarProps {
    onMenuClick: () => void;
    userName?: string;
    userImage?: string;
    userRole?: string;
    onRoleChange?: (role: string) => void;
}

export default function TopBar({
    onMenuClick,
    userName = "Admin User",
    userImage,
    userRole = "SUPER_ADMIN",
    onRoleChange,
}: TopBarProps) {
    return (
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4 lg:hidden">
                <Button variant="ghost" size="icon" onClick={onMenuClick}>
                    <Menu className="w-5 h-5" />
                </Button>
                <span className="font-serif font-bold text-lg text-primary">
                    VisitKKB
                </span>
            </div>

            <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search trips, bookings, or activities..."
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {onRoleChange && (
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">View as:</span>
                        <Select value={userRole} onValueChange={onRoleChange}>
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="OPERATOR">Operator</SelectItem>
                                <SelectItem value="AGENT">Agent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                </Button>

                <div className="h-8 w-px bg-border mx-2 hidden sm:block" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs text-muted-foreground mt-1">Super Admin</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-border overflow-hidden">
                        {userImage ? (
                            <Image
                                src={userImage}
                                alt={userName}
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-medium text-primary">
                                {userName.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

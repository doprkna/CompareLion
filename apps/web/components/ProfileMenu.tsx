"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Shield } from "lucide-react";
import Link from "next/link";

export function ProfileMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === "loading") {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  if (!session?.user) return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">
            {session.user.email}
          </span>
          {session.user.emailVerified ? (
            <Shield className="w-4 h-4 text-green-500" />
          ) : (
            <span className="text-red-500">❌</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium">
          {session.user.name || session.user.email}
        </div>
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {session.user.email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/character" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Character
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

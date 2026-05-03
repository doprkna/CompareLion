"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/auth/isAdmin";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-[240px] flex items-center justify-center text-subtle text-sm">
        Loading…
      </div>
    );
  }

  const user = session?.user ?? null;
  if (!isAdmin(user)) {
    if (typeof window !== "undefined") {
      console.warn("[AdminGuard] Unauthorized admin access attempt");
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <Card className="max-w-md w-full border-border bg-card">
          <CardHeader>
            <CardTitle>Restricted area</CardTitle>
            <CardDescription>This section is for admins only.</CardDescription>
          </CardHeader>
          <CardContent />
          <CardFooter>
            <Button asChild className="w-full bg-accent text-white hover:bg-accent/90">
              <Link href="/main">Back to home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

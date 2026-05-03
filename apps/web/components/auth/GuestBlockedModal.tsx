"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function GuestBlockedModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blocked = searchParams.get("blocked") === "1";

  const [open, setOpen] = useState(blocked);

  useEffect(() => {
    setOpen(blocked);
  }, [blocked]);

  if (!blocked) return null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      router.replace("/landing", { scroll: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border text-text">
        <DialogHeader>
          <DialogTitle>Create an account to continue</DialogTitle>
          <DialogDescription className="text-subtle">
            You&apos;ve reached the edge of the demo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:opacity-95"
          >
            <Link href="/signup">Create account</Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-border">
            <Link href="/flow-demo">Back to demo</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

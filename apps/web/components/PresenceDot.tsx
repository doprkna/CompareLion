/**
 * PresenceDot Component
 * 
 * Shows online/offline status indicator for a user.
 * Updates in real-time via event bus.
 */

'use client';

import { useEffect, useState } from "react";
import { useEventBus } from "@/hooks/useEventBus";

interface PresenceDotProps {
  userId: string;
  className?: string;
}

export default function PresenceDot({ userId, className = "" }: PresenceDotProps) {
  const [online, setOnline] = useState(false);

  // Listen for presence updates
  useEventBus("presence:update", (data: any) => {
    if (data.userId === userId) {
      setOnline(data.status === "online");
    }
  });

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full transition-colors ${
        online ? "bg-green-500 animate-pulse" : "bg-zinc-500"
      } ${className}`}
      title={online ? "Online" : "Offline"}
    />
  );
}












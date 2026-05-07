"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

async function resolvePostLoginDestination(): Promise<"/onboarding" | "/main"> {
  try {
    const res = await fetch("/api/onboarding/start", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    const onboardingCompleted = Boolean(data?.data?.currentState?.onboardingCompleted);
    return onboardingCompleted ? "/main" : "/onboarding";
  } catch {
    return "/main";
  }
}

export default function PostLoginPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?next=/onboarding");
      return;
    }
    if (status !== "authenticated") return;

    void (async () => {
      const destination = await resolvePostLoginDestination();
      router.replace(destination);
    })();
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-gray-600 dark:text-gray-400">Redirecting...</div>
    </div>
  );
}

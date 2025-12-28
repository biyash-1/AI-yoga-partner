"use client";
import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

const SyncUserOnSignIn = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;

    // Check if sync has already been done in this session
    const syncDone = sessionStorage.getItem('userSyncDone');
    if (syncDone === 'true') {
      return;
    }

    hasRun.current = true;

    const syncUser = async () => {
      if (!user) return;

      try {
        const token = await getToken();

        const response = await fetch("http://localhost:5000/api/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to sync user");
        }

        const data = await response.json();
        console.log("User synced:", data);

        // Mark sync as done
        sessionStorage.setItem('userSyncDone', 'true');

        // Only redirect if we're on the home page or auth callback
        if (pathname === '/' || pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
          // Check if user needs onboarding
          if (data.needsOnboarding) {
            toast.success(`Welcome to AI Yoga, ${user.firstName || user.username}! 🎉`);
            router.push("/onboarding");
          } else {
            toast.success(`Welcome back, ${user.firstName || user.username}! 🧘‍♀️`);
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Error syncing user:", err);
        toast.error("Something went wrong. Please try again.");
      }
    };

    syncUser();
  }, [user, getToken, router, pathname]);

  return null;
};

export default SyncUserOnSignIn;
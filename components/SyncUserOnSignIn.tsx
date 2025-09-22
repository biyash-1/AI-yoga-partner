
"use client";
import { useEffect,useRef  } from "react";
import { useUser,useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

const SyncUserOnSignIn = () => {
  const { user } = useUser();
 const {getToken}  = useAuth();
 const hasRun = useRef(false);
  useEffect(() => {

     if (!user || hasRun.current) return;

    hasRun.current = true;
    const syncUser = async () => {
      if (!user) return;

      try {
        const token = await getToken();

        await fetch("http://localhost:5000/api/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(`Welcome back, ${user.firstName || user.username}!`); 
      } catch (err) {
        console.error("Error syncing user:", err);
      }
    };

    syncUser();
  }, [user, getToken]);

  return null; // no UI
};

export default SyncUserOnSignIn;

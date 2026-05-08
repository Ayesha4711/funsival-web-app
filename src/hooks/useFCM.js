"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/firebase";
import axiosInstance from "@/store/axiosInstance";

// Call this once at the app root (e.g. dashboard layout) after the user is logged in.
// It registers the FCM token with the backend and shows foreground notifications.
export function useFCM() {
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const token = await requestNotificationPermission();
        if (!token || cancelled) return;

        // Send the token to your backend so it can target this device
        await axiosInstance.post("/users/fcm-token", { token }).catch(() => {
          // Non-fatal: token registration failure shouldn't break the app
        });

        // Handle messages that arrive while the app is open
        unsubscribeRef.current = await onForegroundMessage((payload) => {
          const { title, body } = payload.notification ?? {};
          toast(body ?? "You have a new message", {
            description: title,
            duration: 5000,
          });
        });
      } catch {
        // Silently ignore — user may have denied permission
      }
    }

    init();

    return () => {
      cancelled = true;
      if (typeof unsubscribeRef.current === "function") {
        unsubscribeRef.current();
      }
    };
  }, []);
}

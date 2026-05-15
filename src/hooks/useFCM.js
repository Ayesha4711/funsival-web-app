"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  requestNotificationPermission,
  onForegroundMessage,
  signInFirebase,
  db,
} from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import axiosInstance from "@/store/axiosInstance";
import { selectUser } from "@/store/slices/profileSlice";
import {
  fetchNotifications,
  prependNotification,
} from "@/store/slices/notificationsSlice";
import { fetchConversations } from "@/store/slices/chatSlice";

// Stores the FCM token so logout can unregister it
let _fcmToken = null;
export function getStoredFcmToken() { return _fcmToken; }

export function useFCM() {
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);
  const unsubscribeRef = useRef(null);   // Firestore listener
  const msgUnsubRef = useRef(null);       // onMessage listener

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Get Firebase custom token from backend → sign Firebase in
        const { data: chatTokenData } = await axiosInstance
          .post("/chats/token")
          .catch(() => ({ data: null }));
        if (chatTokenData?.token) {
          await signInFirebase(chatTokenData.token);
        }

        // 2. Request notification permission + get FCM device token
        const fcmToken = await requestNotificationPermission();
        if (!fcmToken || cancelled) return;
        _fcmToken = fcmToken;

        // 3. Register device token with the backend
        await axiosInstance
          .post("/notifications/device-tokens", { token: fcmToken, platform: "web" })
          .catch(() => {});

        // 4. Firestore real-time inbox listener
        const uid = profile?.id || profile?._id;
        if (uid && db) {
          const q = query(
            collection(db, "notifications"),
            where("userId", "==", uid),
            orderBy("createdAt", "desc")
          );
          unsubscribeRef.current = onSnapshot(q, (snap) => {
            if (cancelled) return;
            dispatch(fetchNotifications({ page: 1 }));
            // Refresh conversations so the message badge updates immediately
            dispatch(fetchConversations());
          }, () => {
            // Firestore permission error (unauthenticated) — silently ignore
          });
        }

        // 5. Foreground message handler — show toast + prepend to state
        msgUnsubRef.current = await onForegroundMessage((payload) => {
          if (cancelled) return;
          const { title, body } = payload.notification ?? {};
          const data = payload.data ?? {};
          toast(title ?? "New notification", {
            description: body ?? "",
            duration: 5000,
          });
          // Optimistically prepend so notification badge updates instantly
          dispatch(prependNotification({
            id: data.notificationId ?? `_fcm_${Date.now()}`,
            title: title ?? "",
            body: body ?? "",
            message: body ?? "",
            read: false,
            isRead: false,
            createdAt: new Date().toISOString(),
            data,
          }));
          // If this is a chat message, refresh conversations so the message
          // badge increments immediately without waiting for the next poll
          if (data.type === "chat_message" || data.conversationId) {
            dispatch(fetchConversations());
          }
        });
      } catch {
        // Silently ignore — user may have denied permission or be offline
      }
    }

    init();

    return () => {
      cancelled = true;
      if (typeof unsubscribeRef.current === "function") unsubscribeRef.current();
      if (typeof msgUnsubRef.current === "function") msgUnsubRef.current();
    };
  }, [dispatch, profile?.id, profile?._id]);
}

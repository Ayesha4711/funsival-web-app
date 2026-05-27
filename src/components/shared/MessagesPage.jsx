"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  fetchMessages,
  startOrGetConversation,
  setActiveConversation,
  markConversationRead,
  clearUnreadCount,
  selectConversations,
  selectActiveConversationId,
} from "@/store/slices/chatSlice";
import { selectUser } from "@/store/slices/profileSlice";
import { onForegroundMessage } from "@/lib/firebase";
import { ArrowLeftIcon as BackIcon } from "@/icons";
import AppFooter from "@/components/shared/AppFooter";
import ContactPanel from "./messages/ContactPanel";
import ChatWindow from "./messages/ChatWindow";
import NoMessageSelected from "./messages/NoMessageSelected";

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);
  const conversations = useSelector(selectConversations);
  const activeConvId = useSelector(selectActiveConversationId);

  const [mobileView, setMobileView] = useState(null);
  const currentUserId = profile?.id || profile?._id || null;

  // Clear active conversation on unmount
  useEffect(() => {
    return () => { dispatch(setActiveConversation(null)); };
  }, [dispatch]);

  // Fetch conversations on mount + poll every 15 s
  useEffect(() => {
    dispatch(fetchConversations());
    const timer = setInterval(() => {
      if (document.visibilityState !== "hidden") dispatch(fetchConversations());
    }, 15_000);
    return () => clearInterval(timer);
  }, [dispatch]);

  // FCM foreground messages
  useEffect(() => {
    let unsubscribe;
    onForegroundMessage((payload) => {
      dispatch(fetchConversations());
      const convId = payload?.data?.conversationId ?? activeConvId;
      if (convId) dispatch(fetchMessages({ conversationId: convId }));
    }).then((unsub) => { unsubscribe = unsub; });
    return () => { if (typeof unsubscribe === "function") unsubscribe(); };
  }, [dispatch, activeConvId]);

  // Deep-link: ?startChat=recipientId&listingId=xxx&message=xxx
  useEffect(() => {
    const recipientId = searchParams.get("startChat");
    const listingId = searchParams.get("listingId");
    const initialMessage = searchParams.get("message");
    if (!recipientId) return;

    dispatch(startOrGetConversation({ recipientId, listingId, initialMessage })).then(
      (result) => {
        const conv = result.payload?.data?.conversation;
        if (conv?.id) {
          dispatch(setActiveConversation(conv.id));
          dispatch(clearUnreadCount(conv.id));
          dispatch(markConversationRead(conv));
        }
      }
    );
  }, [searchParams, dispatch]);

  // Sync mobileView when activeConvId changes
  useEffect(() => {
    if (activeConvId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === activeConvId);
      if (conv) setMobileView(conv);
    }
  }, [activeConvId, conversations]);

  // Auto-select first conversation on desktop if none active
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      const first = conversations[0];
      dispatch(setActiveConversation(first.id));
      dispatch(clearUnreadCount(first.id));
      dispatch(markConversationRead(first));
    }
  }, [conversations, activeConvId, dispatch]);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  const handleSelectConv = (conv) => {
    dispatch(setActiveConversation(conv.id));
    setMobileView(conv);
    dispatch(clearUnreadCount(conv.id));
    dispatch(markConversationRead(conv));
  };

  const handleBack = () => {
    setMobileView(null);
    dispatch(setActiveConversation(null));
  };

  return (
    <>
      <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
        {/* Page header */}
        <div
          className={`px-4 sm:px-6 lg:px-8 py-5 shrink-0 bg-white border-b border-gray-100 ${
            mobileView ? "hidden lg:flex" : "flex"
          } items-center gap-3`}
        >
          <button
            onClick={() => router.back()}
            className="text-text hover:text-text-muted transition-colors"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-extrabold text-text">Messages</h1>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-4 sm:pb-6 flex flex-col">
          <div className="flex-1 min-h-0 bg-white rounded-3xl border border-border overflow-hidden flex">

            {/* Sidebar */}
            <div
              className={`
                flex-col border-r border-gray-100 bg-white
                w-full lg:w-72 xl:w-80 lg:flex shrink-0
                ${mobileView ? "hidden" : "flex"}
                lg:flex
              `}
            >
              <ContactPanel
                activeConvId={activeConvId}
                onSelect={handleSelectConv}
                currentUserId={currentUserId}
              />
            </div>

            {/* Chat window */}
            <div
              className={`flex-1 min-w-0 ${
                mobileView ? "flex flex-col" : "hidden lg:flex lg:flex-col"
              }`}
            >
              {activeConv ? (
                <ChatWindow
                  key={activeConv.id}
                  conv={activeConv}
                  onBack={handleBack}
                  showBackBtn={!!mobileView}
                  currentUserId={currentUserId}
                />
              ) : (
                <NoMessageSelected />
              )}
            </div>

          </div>
        </div>
      </div>

      <AppFooter />
    </>
  );
}

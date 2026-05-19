"use client";

import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const EmojiPicker = lazy(() => import("emoji-picker-react"));
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  startOrGetConversation,
  setActiveConversation,
  appendOptimisticMessage,
  markConversationRead,
  markMessageRead,
  clearUnreadCount,
  selectConversations,
  selectConversationsStatus,
  selectActiveConversationId,
  selectMessagesByConversation,
  selectMessagesStatus,
  selectSendStatus,
} from "@/store/slices/chatSlice";
import { selectUser } from "@/store/slices/profileSlice";
import { onForegroundMessage } from "@/lib/firebase";
import AppFooter from "@/components/shared/AppFooter";
const POLL_INTERVAL_MS = 8000;

import { ArrowLeftIcon as BackIcon, SearchIcon, EmojiIcon, SendIcon, PaperclipIcon } from "@/icons";

const NoMsgIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="45" rx="34" ry="28" fill="#e8edf0" />
    <ellipse cx="32" cy="60" rx="20" ry="16" fill="#d4dde3" />
    <circle cx="50" cy="55" r="16" fill="#8fa3b0" />
    <circle cx="50" cy="55" r="9" fill="white" />
    <line x1="46" y1="51" x2="54" y2="59" stroke="#8fa3b0" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="46" y1="51" x2="46" y2="45" stroke="#8fa3b0" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ─── Read receipt ticks ──────────────────────────────────────────────────────── */
const SingleTick = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoubleTick = ({ blue }) => (
  <svg width="16" height="12" viewBox="0 0 20 16" fill="none">
    <path d="M1 8l4 4 8-8" stroke={blue ? "#4AA7A7" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 8l4 4 8-8" stroke={blue ? "#4AA7A7" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Message bubble with read receipt ───────────────────────────────────────── */
function MessageBubble({ msg, isMe, isReadByOther, alreadyRead, conversationId, dispatch }) {
  const ref = useRef(null);

  useEffect(() => {
    if (isMe || alreadyRead || msg._optimistic) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dispatch(markMessageRead({ conversationId, messageId: msg.id }));
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [msg.id, alreadyRead, isMe, msg._optimistic, conversationId, dispatch]);

  return (
    <div ref={ref} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isMe
          ? `bg-[var(--color-primary)] text-white rounded-tr-sm ${msg._optimistic ? "opacity-70" : ""}`
          : "bg-gray-100 text-[var(--color-text)] rounded-tl-sm"
      }`}>
        {msg.text}
      </div>
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[10px] text-[var(--color-text-muted)]">{formatTime(msg.createdAt)}</span>
        {isMe && !msg._optimistic && (
          <span className={isReadByOther ? "text-[#4AA7A7]" : "text-gray-400"}>
            {isReadByOther ? <DoubleTick blue /> : <SingleTick />}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────────────── */
function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatConvTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ─── Avatar ─────────────────────────────────────────────────────────────────── */
function Avatar({ name = "?", src, size = 10 }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";
  const colours = ["bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-rose-400", "bg-amber-500", "bg-emerald-500"];
  const colour = colours[(name.charCodeAt(0) || 0) % colours.length];

  if (src) {
    return (
      <div className={`relative shrink-0 w-${size} h-${size} rounded-full overflow-hidden`}>
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 w-${size} h-${size} rounded-full ${colour} flex items-center justify-center text-white font-bold text-sm`}>
      {initials}
    </div>
  );
}

/* ─── 3-dot dropdown ─────────────────────────────────────────────────────────── */
// function ChatMenu() {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);
//   const router = useRouter();
//   const pathname = usePathname();
//
//   useEffect(() => {
//     const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);
//
//   const handleViewProfile = () => {
//     setOpen(false);
//     const base = pathname?.startsWith("/user-dashboard") ? "/user-dashboard" : "/dashboard";
//     router.push(`${base}/settings?tab=profile`);
//   };
//
//   return (
//     <div className="relative" ref={ref}>
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-gray-100 transition-colors"
//       >
//         <MoreIcon />
//       </button>
//       {open && (
//         <div className="absolute right-0 top-10 z-30 bg-white border border-gray-200 rounded-2xl py-1.5 min-w-[160px]">
//           <button onClick={handleViewProfile} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-gray-50">View Profile</button>
//           <button onClick={() => setOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">Report</button>
//         </div>
//       )}
//     </div>
//   );
// }

/* ─── Contact List Item ──────────────────────────────────────────────────────── */
function resolveDisplayName(participant) {
  if (!participant) return "Unknown";
  const { name, firstName, lastName, email } = participant;
  // If name looks like an email, prefer firstName+lastName or extract from email
  const isEmail = (s) => typeof s === "string" && s.includes("@");
  if (name && !isEmail(name)) return name;
  if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(" ");
  if (name) return name.split("@")[0]; // use part before @ as fallback
  if (email) return email.split("@")[0];
  return "Unknown";
}

function ConversationItem({ conv, isActive, onClick, currentUserId }) {
  const otherParticipant = Object.values(conv.participantInfo || {}).find(
    (p) => p.id !== currentUserId
  );
  const name = resolveDisplayName(otherParticipant);
  const src = otherParticipant?.profileImage || null;
  const lastMsg = conv.lastMessage;
  const preview = lastMsg?.text && lastMsg.text.trim() ? lastMsg.text : lastMsg?.type === "image" ? "📷 Image" : "No messages yet";
  const time = formatConvTime(conv.lastMessageAt);
  const unread = currentUserId ? (conv.unreadCount?.[currentUserId] ?? 0) : 0;

  return (
    <button
      onClick={() => onClick(conv)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}`}
    >
      <Avatar name={name} src={src} size={10} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{name}</p>
          <span className="text-[10px] text-[var(--color-text-muted)] shrink-0 ml-2">{time}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)] truncate">{preview}</p>
          {unread > 0 && (
            <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-[var(--color-secondary)] text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Sidebar / Contact panel ────────────────────────────────────────────────── */
function ContactPanel({ activeConvId, onSelect, currentUserId }) {
  const dispatch = useDispatch();
  const conversations = useSelector(selectConversations);
  const convStatus = useSelector(selectConversationsStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Unread"];

  const filtered = conversations.filter((conv) => {
    const otherParticipant = Object.values(conv.participantInfo || {}).find(
      (p) => p.id !== currentUserId
    );
    const name = resolveDisplayName(otherParticipant);
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "Unread") {
      return matchesSearch && (conv.unreadCount?.[currentUserId] ?? 0) > 0;
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-gray-100 rounded-full text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === tab
                ? "bg-[var(--color-primary)] text-white"
                : "border border-gray-200 text-[var(--color-text-muted)] hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {convStatus === "loading" && (
          <div className="flex flex-col gap-2 px-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {convStatus !== "loading" && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-3xl">💬</span>
            <p className="text-sm font-medium text-gray-400 bg-gray-50 border border-gray-100 px-4 py-1.5 rounded-full">
              No conversations yet
            </p>
          </div>
        )}
        {filtered.map((conv) => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            isActive={activeConvId === conv.id}
            onClick={onSelect}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Chat Window ────────────────────────────────────────────────────────────── */
function ChatWindow({ conv, onBack, showBackBtn, currentUserId }) {
  const dispatch = useDispatch();
  const messagesStatus = useSelector(selectMessagesStatus);
  const sendStatus = useSelector(selectSendStatus);
  const messages = useSelector(selectMessagesByConversation(conv.id));
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const messagesContainerRef = useRef(null);
  const prevMessageCountRef = useRef(null);
  const emojiRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const otherParticipant = Object.values(conv.participantInfo || {}).find(
    (p) => p.id !== currentUserId
  );
  const name = resolveDisplayName(otherParticipant);
  const src = otherParticipant?.profileImage || null;

  useEffect(() => {
    prevMessageCountRef.current = null;
    dispatch(fetchMessages({ conversationId: conv.id }));
    // Mark conversation read immediately on open so the badge clears right away
    dispatch(clearUnreadCount(conv.id));
    dispatch(markConversationRead(conv));

    // Poll for new messages while this chat window is open.
    // Skip the poll for 4s after a send to avoid overwriting optimistic messages.
    const timer = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() - lastSentAtRef.current < 4000) return;
      dispatch(fetchMessages({ conversationId: conv.id }));
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [conv.id, dispatch]);

  useEffect(() => {
    const prev = prevMessageCountRef.current;
    const curr = messages.length;
    const el = messagesContainerRef.current;
    if (!el) { prevMessageCountRef.current = curr; return; }
    if (prev === null) {
      el.scrollTop = el.scrollHeight;
    } else if (curr > prev) {
      // New message arrived from the other person — mark as read immediately
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== currentUserId) {
        dispatch(clearUnreadCount(conv.id));
        dispatch(markConversationRead(conv));
      }
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
    prevMessageCountRef.current = curr;
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sendStatus === "loading") return;
    setText("");
    lastSentAtRef.current = Date.now();

    // Optimistic update
    const tempId = `_opt_${Date.now()}`;
    dispatch(appendOptimisticMessage({
      conversationId: conv.id,
      message: {
        id: tempId,
        _optimistic: true,
        senderId: currentUserId,
        type: "text",
        text: trimmed,
        createdAt: new Date().toISOString(),
        sender: { id: currentUserId },
      },
    }));

    try {
      await dispatch(sendMessage({ conversationId: conv.id, text: trimmed })).unwrap();
    } catch {
      toast.error("Failed to send message.");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
        {showBackBtn && (
          <button onClick={onBack} className="mr-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <BackIcon />
          </button>
        )}
        <Avatar name={name} src={src} size={10} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--color-text)]">{name}</p>
          {otherParticipant?.role && (
            <p className="text-xs text-gray-400 capitalize">{otherParticipant.role}</p>
          )}
        </div>
        {/* <ChatMenu /> */}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        {messagesStatus === "loading" && messages.length === 0 && (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div className={`h-9 rounded-2xl bg-gray-200 ${i % 2 === 0 ? "w-48" : "w-56"}`} />
              </div>
            ))}
          </div>
        )}

        {messages.length > 0 && (
          <>
            <div className="flex items-center justify-center">
              <span className="text-xs text-[var(--color-text-muted)] bg-gray-100 px-3 py-1 rounded-full">
                {new Date(messages[0].createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              const otherUserId = otherParticipant?.id;
              const isReadByOther = Array.isArray(msg.readBy) && otherUserId && msg.readBy.includes(otherUserId);
              const alreadyRead = !isMe && Array.isArray(msg.readBy) && currentUserId && msg.readBy.includes(currentUserId);
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={isMe}
                  isReadByOther={isReadByOther}
                  alreadyRead={alreadyRead}
                  conversationId={conv.id}
                  dispatch={dispatch}
                />
              );
            })}
          </>
        )}

        {messagesStatus !== "loading" && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center py-12">
            <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
          </div>
        )}

      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-100 shrink-0">
        <div className="relative" ref={emojiRef}>
          {emojiOpen && (
            <div className="absolute bottom-14 left-0 z-30">
              <Suspense fallback={null}>
                <EmojiPicker
                  onEmojiClick={(e) => setText((t) => t + e.emoji)}
                  skinTonesDisabled
                  searchDisabled={false}
                  height={380}
                  width={320}
                />
              </Suspense>
            </div>
          )}
          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2">
            <button
              type="button"
              onClick={() => setEmojiOpen((v) => !v)}
              className={`text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0 ${emojiOpen ? "text-[var(--color-primary)]" : ""}`}
            >
              <EmojiIcon />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
              title="Attach photo or video"
            >
              <PaperclipIcon />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) toast.info(`Selected: ${file.name}`);
                e.target.value = "";
              }}
            />
            <input
              type="text"
              placeholder="Type a message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none min-w-0"
            />
            <button
              onClick={handleSend}
              disabled={sendStatus === "loading" || !text.trim()}
              className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────────────── */
function NoMessageSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <NoMsgIcon />
      <p className="text-lg font-bold text-[var(--color-text)]">No Messages</p>
      <p className="text-sm text-[var(--color-text-muted)]">Select a conversation to start chatting</p>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);

  const conversations = useSelector(selectConversations);
  const activeConvId = useSelector(selectActiveConversationId);
  const [mobileView, setMobileView] = useState(null);

  const currentUserId = profile?.id || profile?._id || null;

  // Clear active conversation on unmount so the badge isn't auto-cleared next visit
  useEffect(() => {
    return () => { dispatch(setActiveConversation(null)); };
  }, [dispatch]);

  // Fetch conversations on mount and poll every 15s to keep sidebar list fresh
  useEffect(() => {
    dispatch(fetchConversations());
    const timer = setInterval(() => {
      if (document.visibilityState !== "hidden") dispatch(fetchConversations());
    }, 15000);
    return () => clearInterval(timer);
  }, [dispatch]);

  // When a chat FCM message arrives while the app is open, pull new messages
  // for the active conversation immediately (conversations are handled by navbar FCM)
  useEffect(() => {
    let unsubscribe;
    onForegroundMessage((payload) => {
      dispatch(fetchConversations());
      const convId = payload?.data?.conversationId ?? activeConvId;
      if (convId) dispatch(fetchMessages({ conversationId: convId }));
    }).then((unsub) => { unsubscribe = unsub; });
    return () => { if (typeof unsubscribe === "function") unsubscribe(); };
  }, [dispatch, activeConvId]);

  // Handle deep-link from booking success: ?startChat=recipientId&listingId=xxx&message=xxx
  useEffect(() => {
    const recipientId = searchParams.get("startChat");
    const listingId = searchParams.get("listingId");
    const initialMessage = searchParams.get("message");

    if (!recipientId) return;

    dispatch(
      startOrGetConversation({ recipientId, listingId, initialMessage })
    ).then((result) => {
      const conv = result.payload?.data?.conversation;
      if (conv?.id) {
        dispatch(setActiveConversation(conv.id));
        dispatch(clearUnreadCount(conv.id));
        dispatch(markConversationRead(conv));
      }
    });
  }, [searchParams, dispatch]);

  // Auto-select the active conversation when id changes
  useEffect(() => {
    if (activeConvId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === activeConvId);
      if (conv) setMobileView(conv);
    }
  }, [activeConvId, conversations]);

  // Auto-select first conversation on load if none is active (desktop only)
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
    // Optimistically clear badge immediately, then confirm with backend
    dispatch(clearUnreadCount(conv.id));
    dispatch(markConversationRead(conv));
  };

  const handleBack = () => {
    setMobileView(null);
    dispatch(setActiveConversation(null));
  };

  return (
    <>
      {/* Chat section — fixed height so footer sits naturally below */}
      <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
        {/* Page header */}
        <div className={`px-4 sm:px-6 lg:px-8 py-5 shrink-0 bg-white border-b border-gray-100 ${mobileView ? "hidden lg:flex" : "flex"} items-center gap-3`}>
          <button
            onClick={() => router.back()}
            className="text-[var(--color-text)] hover:text-[var(--color-text-muted)] transition-colors"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-extrabold text-[var(--color-text)]">Messages</h1>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-4 sm:pb-6 flex flex-col">
          <div className="flex-1 min-h-0 bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden flex">

            {/* Contact list panel */}
            <div className={`
              flex-col border-r border-gray-100 bg-white
              w-full lg:w-72 xl:w-80 lg:flex shrink-0
              ${mobileView ? "hidden" : "flex"}
              lg:flex
            `}>
              <ContactPanel
                activeConvId={activeConvId}
                onSelect={handleSelectConv}
                currentUserId={currentUserId}
              />
            </div>

            {/* Chat window */}
            <div className={`
              flex-1 min-w-0
              ${mobileView ? "flex flex-col" : "hidden lg:flex lg:flex-col"}
            `}>
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

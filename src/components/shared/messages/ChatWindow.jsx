"use client";

import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchMessages,
  sendMessage,
  uploadChatMedia,
  sendMediaMessage,
  appendOptimisticMessage,
  markConversationRead,
  clearUnreadCount,
  selectMessagesByConversation,
  selectMessagesStatus,
  selectSendStatus,
} from "@/store/slices/chatSlice";
import { ArrowLeftIcon as BackIcon, EmojiIcon, SendIcon, PaperclipIcon, CloseIcon } from "@/icons";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import { resolveDisplayName } from "./messageHelpers";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const POLL_INTERVAL_MS = 8000;

export default function ChatWindow({ conv, onBack, showBackBtn, currentUserId }) {
  const dispatch = useDispatch();
  const messagesStatus = useSelector(selectMessagesStatus);
  const sendStatus = useSelector(selectSendStatus);
  const messages = useSelector(selectMessagesByConversation(conv.id));

  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pendingMedia, setPendingMedia] = useState(null); // { file, previewUrl, isVideo }
  const [mediaSending, setMediaSending] = useState(false);
  const messagesContainerRef = useRef(null);
  const prevMessageCountRef = useRef(null);
  const emojiRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const fileInputRef = useRef(null);

  const otherParticipant = Object.values(conv.participantInfo || {}).find(
    (p) => p.id !== currentUserId
  );
  const name = resolveDisplayName(otherParticipant);
  const src = otherParticipant?.profileImage || null;

  // Close emoji picker on outside click
  useEffect(() => {
    const h = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Fetch messages + start poll
  useEffect(() => {
    prevMessageCountRef.current = null;
    dispatch(fetchMessages({ conversationId: conv.id }));
    dispatch(clearUnreadCount(conv.id));
    dispatch(markConversationRead(conv));

    const timer = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() - lastSentAtRef.current < 4000) return;
      dispatch(fetchMessages({ conversationId: conv.id }));
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [conv.id, dispatch]);

  // Auto-scroll + mark read on new messages
  useEffect(() => {
    const prev = prevMessageCountRef.current;
    const curr = messages.length;
    const el = messagesContainerRef.current;
    if (!el) { prevMessageCountRef.current = curr; return; }

    if (prev === null) {
      el.scrollTop = el.scrollHeight;
    } else if (curr > prev) {
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

    const tempId = `_opt_${Date.now()}`;
    dispatch(
      appendOptimisticMessage({
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
      })
    );

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

  // Revoke the local preview URL whenever it's replaced or the component unmounts
  useEffect(() => {
    return () => {
      if (pendingMedia?.previewUrl) URL.revokeObjectURL(pendingMedia.previewUrl);
    };
  }, [pendingMedia]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const MAX_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      toast.error("File exceeds the 50 MB limit.");
      return;
    }

    setPendingMedia({ file, previewUrl: URL.createObjectURL(file), isVideo });
  };

  const handleCancelMedia = () => {
    if (pendingMedia?.previewUrl) URL.revokeObjectURL(pendingMedia.previewUrl);
    setPendingMedia(null);
  };

  const handleConfirmMedia = async () => {
    if (!pendingMedia || mediaSending) return;
    const { file, previewUrl, isVideo } = pendingMedia;
    setMediaSending(true);

    const tempId = `_opt_${Date.now()}`;
    dispatch(
      appendOptimisticMessage({
        conversationId: conv.id,
        message: {
          id: tempId,
          _optimistic: true,
          senderId: currentUserId,
          type: isVideo ? "video" : "image",
          mediaUrl: previewUrl,
          createdAt: new Date().toISOString(),
          sender: { id: currentUserId },
        },
      })
    );

    setPendingMedia(null);

    try {
      lastSentAtRef.current = Date.now();
      const mediaUpload = await dispatch(uploadChatMedia({ file })).unwrap();
      await dispatch(sendMediaMessage({ conversationId: conv.id, mediaUpload })).unwrap();
    } catch {
      toast.error("Failed to send file.");
    } finally {
      setMediaSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header — name/avatar always shown; back button only on mobile/tablet,
          where the conversation list isn't visible alongside the chat */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
        {showBackBtn && (
          <button
            onClick={onBack}
            className="mr-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors lg:hidden"
          >
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
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4"
      >
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
                {new Date(messages[0].createdAt).toLocaleDateString([], {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              const otherUserId = otherParticipant?.id;
              const isReadByOther =
                Array.isArray(msg.readBy) && otherUserId && msg.readBy.includes(otherUserId);
              const alreadyRead =
                !isMe &&
                Array.isArray(msg.readBy) &&
                currentUserId &&
                msg.readBy.includes(currentUserId);
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
        {/* Media preview — shown before the file is actually sent */}
        {pendingMedia && (
          <div className="mb-3 flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/5 shrink-0">
              {pendingMedia.isVideo ? (
                <video src={pendingMedia.previewUrl} className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pendingMedia.previewUrl} alt="Selected preview" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{pendingMedia.file.name}</p>
              <p className="text-xs text-gray-400">{pendingMedia.isVideo ? "Video" : "Image"} ready to send</p>
            </div>
            <button
              type="button"
              onClick={handleCancelMedia}
              disabled={mediaSending}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Cancel"
            >
              <CloseIcon size={16} />
            </button>
            <button
              type="button"
              onClick={handleConfirmMedia}
              disabled={mediaSending}
              className="shrink-0 w-9 h-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              title="Send"
            >
              <SendIcon />
            </button>
          </div>
        )}

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
              className={`text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0 ${
                emojiOpen ? "text-[var(--color-primary)]" : ""
              }`}
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
              onChange={handleFileSelect}
            />

            <input
              type="text"
              placeholder="Type a message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none min-w-0"
            />

            {!pendingMedia && (
              <button
                onClick={handleSend}
                disabled={sendStatus === "loading" || !text.trim()}
                className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <SendIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

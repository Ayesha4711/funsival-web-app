"use client";

import React, { useRef, useEffect } from "react";
import { SingleTickIcon, DoubleTickIcon } from "@/icons";
import { markMessageRead } from "@/store/slices/chatSlice";
import { formatTime } from "./messageHelpers";

function SingleTick() {
  return <SingleTickIcon size={12} />;
}

function DoubleTick({ blue }) {
  return <DoubleTickIcon size={16} blue={blue} />;
}

export default function MessageBubble({
  msg,
  isMe,
  isReadByOther,
  alreadyRead,
  conversationId,
  dispatch,
}) {
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

  const isImage = msg.type === "image";
  const isVideo = msg.type === "video";
  const mediaSrc = msg.mediaUrl || msg.imageUrl || msg.fileUrl || msg.url || msg.text;

  return (
    <div ref={ref} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl text-sm leading-relaxed overflow-hidden ${
          isMe
            ? `bg-[var(--color-primary)] text-white rounded-tr-sm ${msg._optimistic ? "opacity-70" : ""}`
            : "bg-gray-100 text-[var(--color-text)] rounded-tl-sm"
        } ${isImage || isVideo ? "" : "px-4 py-2.5"}`}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaSrc} alt="img" className="max-w-full max-h-60 object-cover rounded-2xl" />
        ) : isVideo ? (
          <video src={mediaSrc} controls className="max-w-full max-h-60 rounded-2xl" />
        ) : (
          <span className="px-4 py-2.5 block">{msg.text}</span>
        )}
      </div>

      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {formatTime(msg.createdAt)}
        </span>
        {isMe && !msg._optimistic && (
          <span className={isReadByOther ? "text-[#4AA7A7]" : "text-gray-400"}>
            {isReadByOther ? <DoubleTick blue /> : <SingleTick />}
          </span>
        )}
      </div>
    </div>
  );
}

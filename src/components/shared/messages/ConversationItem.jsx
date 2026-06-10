"use client";

import React from "react";
import Avatar from "./Avatar";
import { resolveDisplayName, formatConvTime } from "./messageHelpers";

export default function ConversationItem({ conv, isActive, onClick, currentUserId }) {
  const otherParticipant = Object.values(conv.participantInfo || {}).find(
    (p) => p.id !== currentUserId
  );
  const name = resolveDisplayName(otherParticipant);
  const src = otherParticipant?.profileImage || null;
  const lastMsg = conv.lastMessage;
  const preview = (() => {
    if (!lastMsg) return "No messages yet";
    if (lastMsg.type === "image") return "📷 Image";
    if (lastMsg.type === "video") return "🎬 Video";
    if (lastMsg.type === "file") return "📎 File";
    return lastMsg.text?.trim() || "No messages yet";
  })();
  const time = formatConvTime(conv.lastMessageAt);
  const unread = currentUserId ? (conv.unreadCount?.[currentUserId] ?? 0) : 0;

  return (
    <button
      onClick={() => onClick(conv)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
        isActive ? "bg-gray-100" : "hover:bg-gray-50"
      }`}
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

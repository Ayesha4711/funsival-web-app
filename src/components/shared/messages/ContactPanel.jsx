"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectConversations,
  selectConversationsStatus,
} from "@/store/slices/chatSlice";
import { SearchIcon } from "@/icons";
import ConversationItem from "./ConversationItem";
import { resolveDisplayName } from "./messageHelpers";

export default function ContactPanel({ activeConvId, onSelect, currentUserId }) {
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
      {/* Search */}
      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 bg-gray-100 rounded-full text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
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

      {/* List */}
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

"use client";

import React from "react";
import { NoMessagesIcon } from "@/icons";

export default function NoMessageSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <NoMessagesIcon size={80} />
      <p className="text-lg font-bold text-[var(--color-text)]">No Messages</p>
      <p className="text-sm text-[var(--color-text-muted)]">
        Select a conversation to start chatting
      </p>
    </div>
  );
}

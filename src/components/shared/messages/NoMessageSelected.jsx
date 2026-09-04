"use client";

import React from "react";
import Image from "next/image";

export default function NoMessageSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <Image
        src="/images/No messaging.png"
        alt="No messages"
        width={160}
        height={160}
        className="object-contain"
      />
      <p className="text-lg font-bold text-[var(--color-text)]">No Messages</p>
      <p className="text-sm text-[var(--color-text-muted)]">
        Select a conversation to start chatting
      </p>
    </div>
  );
}

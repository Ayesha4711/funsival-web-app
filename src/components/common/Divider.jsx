import React from 'react';

export default function Divider({ label = 'or' }) {
  return (
    <div className="relative flex items-center">
      <div className="flex-grow border-t border-[var(--color-border)]" />
      <span className="mx-3 shrink-0 text-xs text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="flex-grow border-t border-[var(--color-border)]" />
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Positions a portaled dropdown/menu next to its trigger button and locks
 * page scroll while open, so the menu never has to track scroll movement.
 */
export default function useDropdownPosition({ width, getHeight, align = "left" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef  = useRef(null);
  const menuRef = useRef(null);

  const computePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect   = btnRef.current.getBoundingClientRect();
    const height = getHeight ? getHeight() : 0;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = height > 0 && spaceBelow < height + 12;
    const rawLeft = align === "right" ? rect.right - width : rect.left;
    setPos({
      top:  openUp ? rect.top - height - 4 : rect.bottom + 4,
      left: Math.min(Math.max(rawLeft, 8), window.innerWidth - width - 8),
    });
  }, [width, getHeight, align]);

  const toggle = useCallback(() => {
    computePosition();
    setOpen((o) => !o);
  }, [computePosition]);
  const close  = useCallback(() => setOpen(false), []);

  // Lock page scroll while the menu is open instead of tracking scroll position.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    function blockScroll(e) {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      e.preventDefault();
    }
    const opts = { passive: false };
    document.addEventListener("wheel", blockScroll, opts);
    document.addEventListener("touchmove", blockScroll, opts);

    function onMouseDown(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);

    function onResize() { computePosition(); }
    window.addEventListener("resize", onResize);

    return () => {
      body.style.overflow = prevOverflow;
      document.removeEventListener("wheel", blockScroll, opts);
      document.removeEventListener("touchmove", blockScroll, opts);
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open, computePosition]);

  return { open, toggle, close, pos, btnRef, menuRef };
}

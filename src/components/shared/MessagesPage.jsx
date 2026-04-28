"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ─── Mock data ──────────────────────────────────────────────────────────────── */
const CONTACTS = [
  { id: 1, name: "David H. Brown",  preview: "Hi, want to know more about....", time: "2:24 pm", unread: 0,  online: true  },
  { id: 2, name: "Lake Serene",     preview: "Hi, want to know more about....", time: "2:24 pm", unread: 3,  online: false },
  { id: 3, name: "Jordan Lake",     preview: "Hi, want to know more about....", time: "2:24 pm", unread: 1,  online: false },
  { id: 4, name: "Alina James",     preview: "Hi, want to know more about....", time: "2:24 pm", unread: 0,  online: false },
  { id: 5, name: "Alex Tim",        preview: "Hi, want to know more about....", time: "2:24 pm", unread: 0,  online: false },
  { id: 6, name: "Fabian Chris",    preview: "Hi, want to know more about....", time: "2:24 pm", unread: 0,  online: false },
  { id: 7, name: "Fabian Chris",    preview: "Hi, want to know more about....", time: "2:24 pm", unread: 0,  online: false },
];

const MESSAGES_MAP = {
  1: [
    { id: 1, from: "them", text: "I want to make an appointment tomorrow from 2:00pm to 3:00pm?", time: "1:55pm" },
    { id: 2, from: "me",   text: "Hello, Thomas! I will check the schedule and inform you",        time: "1:58pm" },
    { id: 3, from: "them", text: "Sure, Thanks",                                                   time: "1:59pm" },
    { id: 4, from: "me",   text: "You are welcome!",                                               time: "2:00pm" },
    { id: 5, from: "them", text: "I want to make an appointment tomorrow from 2:00pm to 3:00pm?I want to make an appointment tomorrow from 2:00pm to 3:00pm?", time: "1:59pm" },
    { id: 6, from: "me",   text: "You are welcome!",                                               time: "2:00pm" },
    { id: 7, from: "them", text: "Sure, Thanks",                                                   time: "1:59pm" },
  ],
};

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5"  r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);

const EmojiIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const AttachIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const NoMsgIcon = () => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
    <ellipse cx="50" cy="45" rx="34" ry="28" fill="#e8edf0" />
    <ellipse cx="32" cy="60" rx="20" ry="16" fill="#d4dde3" />
    <circle  cx="50" cy="55" r="16" fill="#8fa3b0" />
    <circle  cx="50" cy="55" r="9"  fill="white" />
    <line x1="46" y1="51" x2="54" y2="59" stroke="#8fa3b0" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="46" y1="51" x2="46" y2="45" stroke="#8fa3b0" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ─── Avatar ─────────────────────────────────────────────────────────────────── */
function Avatar({ name, size = 10, online = false }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const colours = ["bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-rose-400", "bg-amber-500", "bg-emerald-500"];
  const colour = colours[name.charCodeAt(0) % colours.length];
  return (
    <div className={`relative shrink-0 w-${size} h-${size} rounded-full ${colour} flex items-center justify-center text-white font-bold text-sm`}>
      {initials}
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />}
    </div>
  );
}

/* ─── Contact List Item ──────────────────────────────────────────────────────── */
function ContactItem({ contact, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(contact)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}`}
    >
      <Avatar name={contact.name} size={10} online={contact.online} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{contact.name}</p>
          <span className="text-[10px] text-[var(--color-text-muted)] shrink-0 ml-2">{contact.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)] truncate">{contact.preview}</p>
          {contact.unread > 0 && (
            <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-[var(--color-secondary)] text-white text-[10px] font-bold flex items-center justify-center">
              {contact.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Sidebar / Contact panel ────────────────────────────────────────────────── */
function ContactPanel({ activeContact, onSelect, searchQuery, setSearchQuery, activeTab, setActiveTab }) {
  const tabs = ["All", "Unread", "Favourites"];

  const filtered = CONTACTS.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "Unread")     return matchesSearch && c.unread > 0;
    if (activeTab === "Favourites") return false;
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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-3xl">🔍</span>
            <p className="text-sm font-medium text-orange-400 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full">
              No result found
            </p>
          </div>
        ) : (
          filtered.map((c) => (
            <ContactItem key={c.id} contact={c} isActive={activeContact?.id === c.id} onClick={onSelect} />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── 3-dot dropdown ─────────────────────────────────────────────────────────── */
function ChatMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-gray-100 transition-colors"
      >
        <MoreIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 bg-white border border-gray-200 rounded-2xl py-1.5 min-w-[160px]">
          <button onClick={() => setOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-gray-50">View Profile</button>
          <button onClick={() => setOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-gray-50">Search message</button>
          <button onClick={() => setOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">Report</button>
        </div>
      )}
    </div>
  );
}

/* ─── Chat Window ────────────────────────────────────────────────────────────── */
function ChatWindow({ contact, onBack, showBackBtn }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(MESSAGES_MAP[contact.id] ?? []);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "me", text: trimmed, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setText("");
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
        {showBackBtn && (
          <button onClick={onBack} className="mr-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <BackIcon />
          </button>
        )}
        <Avatar name={contact.name} size={10} online={contact.online} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--color-text)]">{contact.name}</p>
          <p className="text-xs font-medium" style={{ color: contact.online ? "#22c55e" : "#9ca3af" }}>
            {contact.online ? "Online" : "Offline"}
          </p>
        </div>
        <ChatMenu />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <span className="text-xs text-[var(--color-text-muted)] bg-gray-100 px-3 py-1 rounded-full">Today</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.from === "me" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.from === "me"
                ? "bg-[var(--color-primary)] text-white rounded-tr-sm"
                : "bg-gray-100 text-[var(--color-text)] rounded-tl-sm"
            }`}>
              {msg.text}
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] mt-1 px-1">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2">
          <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"><EmojiIcon /></button>
          <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"><AttachIcon /></button>
          <input
            type="text"
            placeholder="Type a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none min-w-0"
          />
          <button
            onClick={sendMessage}
            className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          >
            <SendIcon />
          </button>
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
/**
 * Shared messages page used by both provider dashboard and user dashboard.
 *
 * No props required — the wrapping layout/navbar is handled by the parent page.
 */
export default function MessagesPage() {
  const router = useRouter();
  const [activeContact, setActiveContact] = useState(CONTACTS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [mobileView, setMobileView] = useState(null);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    setMobileView(contact);
  };

  const handleBack = () => setMobileView(null);

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 64px)" }}>
      {/* Page header */}
      <div className={`px-4 sm:px-6 lg:px-8 py-4 shrink-0 ${mobileView ? "hidden lg:flex" : "flex"} items-center gap-3`}>
        <button
          onClick={() => router.back()}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-xl font-extrabold text-[var(--color-text)]">Messages</h1>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <div className="h-full bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden flex">

          {/* Contact list panel */}
          <div className={`
            flex-col border-r border-gray-100 bg-white
            w-full lg:w-72 xl:w-80 lg:flex shrink-0
            ${mobileView ? "hidden" : "flex"}
            lg:flex
          `}>
            <ContactPanel
              activeContact={activeContact}
              onSelect={handleSelectContact}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Chat window */}
          <div className={`
            flex-1 min-w-0
            ${mobileView ? "flex flex-col" : "hidden lg:flex lg:flex-col"}
          `}>
            {activeContact ? (
              <ChatWindow
                key={activeContact.id}
                contact={activeContact}
                onBack={handleBack}
                showBackBtn={!!mobileView}
              />
            ) : (
              <NoMessageSelected />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

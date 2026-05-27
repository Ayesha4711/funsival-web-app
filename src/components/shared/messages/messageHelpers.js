/** Format an ISO timestamp to HH:MM (12-hr). */
export function formatTime(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format conversation list timestamp (today / Yesterday / weekday / date). */
export function formatConvTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const diffDays = Math.floor((Date.now() - d) / 86_400_000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Resolve a participant object to a display name. */
export function resolveDisplayName(participant) {
  if (!participant) return "Unknown";
  const { name, firstName, lastName, email } = participant;
  const isEmail = (s) => typeof s === "string" && s.includes("@");
  if (name && !isEmail(name)) return name;
  if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(" ");
  if (name) return name.split("@")[0];
  if (email) return email.split("@")[0];
  return "Unknown";
}

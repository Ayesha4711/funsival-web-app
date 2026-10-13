"use client";

import useViewerTimeZone from "@/lib/useViewerTimeZone";

const shortDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
};
const clockLabel = value => {
  if (!/^\d{2}:\d{2}$/.test(value || "")) return "";
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
};
const fullDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
};

export default function BookingTimeDisplay({ booking, className = "", field, layout }) {
  const viewerTimeZone = useViewerTimeZone();
  const schedule = booking.localSchedule;
  if (!viewerTimeZone) return null;
  if (!schedule || schedule.timeZone !== viewerTimeZone) {
    return <p className={`text-xs text-gray-500 ${className}`}>Local schedule unavailable</p>;
  }
  if (layout === "table") {
    const groups = new Map();
    for (const range of schedule.ranges) {
      const key = `${range.startDate}|${range.endDate}`;
      if (!groups.has(key)) groups.set(key, { startDate: range.startDate, endDate: range.endDate, times: [] });
      if (range.startTime) {
        const start = clockLabel(range.startTime);
        const end = clockLabel(range.endTime);
        groups.get(key).times.push(!end || start === end ? start : `${start} – ${end}`);
      }
    }
    return (
      <div className={`min-w-0 space-y-2 ${className}`} style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}>
        {[...groups.values()].map((group, index) => (
          <div key={index}>
            <p className="text-[12px] text-[var(--color-text)] font-semibold whitespace-nowrap">
              {fullDate(group.startDate)}{group.endDate !== group.startDate ? ` – ${fullDate(group.endDate)}` : ""}
            </p>
            {group.times.length > 0 && <div className="mt-0.5 flex flex-col gap-0.5 text-[11px] text-[var(--color-text-muted)] whitespace-nowrap">
              {group.times.map((time, timeIndex) => <span key={timeIndex}>{time}</span>)}
            </div>}
          </div>
        ))}
      </div>
    );
  }
  if (field) {
    const dates = [...new Set(schedule.ranges.map(range => range.startDate === range.endDate
      ? shortDate(range.startDate) : `${shortDate(range.startDate)} – ${shortDate(range.endDate)}`))];
    const multipleDates = new Set(schedule.ranges.flatMap(range => [range.startDate, range.endDate])).size > 1;
    const times = schedule.ranges.filter(range => range.startTime).map(range => {
      const start = clockLabel(range.startTime);
      const end = clockLabel(range.endTime);
      if (multipleDates) return `${shortDate(range.startDate)} · ${start} – ${shortDate(range.endDate)} · ${end}`;
      return start === end ? start : `${start} – ${end}`;
    });
    if (field === "time" && !times.length) return null;
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <span className="text-gray-500 w-36 text-xs shrink-0">{field === "date" ? "Reservation Dates:" : "Time:"}</span>
        <div className="font-bold text-sm text-gray-900">
          {(field === "date" ? dates : times).map((value, index) => <p key={index}>{value}</p>)}
        </div>
      </div>
    );
  }
  return (
    <div className={`min-w-0 text-xs space-y-1 ${className}`}>
      <p className="font-medium text-gray-500">Your local time</p>
      {schedule.ranges.map((range, index) => (
        <p key={index} className="font-semibold text-gray-900">{range.label}</p>
      ))}
    </div>
  );
}

"use client";

import React from "react";

function StatCard({ label, value, sub, subColor = "text-green-500" }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-1">
      <p className="text-xs text-[var(--color-text-muted)] font-medium">{label}</p>
      <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

export default function ReservationStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        label="Total Reservations" 
        value="66" 
        sub="+2 from last week" 
        subColor="text-[var(--color-primary)]" 
      />
      <StatCard 
        label="Revenue" 
        value="$1801" 
        sub="+8% from last month" 
        subColor="text-[var(--color-primary)]" 
      />
      <StatCard 
        label="Active Customers" 
        value="8" 
        sub="+3 new this week" 
        subColor="text-[var(--color-primary)]" 
      />
      <StatCard 
        label="Completion Rate" 
        value="98%" 
        sub="+1.2% from last month" 
        subColor="text-[var(--color-primary)]" 
      />
    </div>
  );
}

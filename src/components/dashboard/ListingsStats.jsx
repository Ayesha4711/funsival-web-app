"use client";

import React from "react";

function StatCard({ label, value, sub, subColor = "text-green-500" }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)] flex flex-col gap-1">
      <p className="text-xs text-[var(--color-text-muted)] font-medium">{label}</p>
      <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

export default function ListingsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        label="Total Listings" 
        value="12" 
        sub="+15% this quarter" 
        subColor="text-green-500" 
      />
      <StatCard 
        label="Listing Views" 
        value="1331" 
        sub="+2 this month" 
        subColor="text-green-500" 
      />
      <StatCard 
        label="Total Bookings" 
        value="1601" 
        sub="+8% from last month" 
        subColor="text-green-500" 
      />
      <StatCard 
        label="Avg. Rating" 
        value="98%" 
        sub="+0.3 from last month" 
        subColor="text-green-500" 
      />
    </div>
  );
}

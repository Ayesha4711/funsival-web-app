// "use client";

// import React from "react";

// function StatCard({ label, value, sub, subColor = "text-[#16A34A]" }) {
//   return (
//     <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-1">
//       <p className="text-xs text-[var(--color-text-muted)] font-medium">
//         {label}
//       </p>
//       <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">
//         {value}
//       </p>
//       {sub &&
//         <p className={`text-xs font-medium ${subColor}`}>
//           {sub}
//         </p>}
//     </div>
//   );
// }

// export default function ListingsStats() {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//       <StatCard
//         label="Total Listings"
//         value="12"
//         sub="+15% this quarter"
//         subColor="text-[#16A34A]"
//       />
//       <StatCard
//         label="Listing Views"
//         value="1331"
//         sub="+2 this month"
//         subColor="text-green-500"
//       />
//       <StatCard
//         label="Total Bookings"
//         value="1601"
//         sub="+8% from last month"
//         subColor="text-green-500"
//       />
//       <StatCard
//         label="Avg. Rating"
//         value="98%"
//         sub="+0.3 from last month"
//         subColor="text-green-500"
//       />
//     </div>
//   );
// }

"use client";

import React from "react";

// Semantic color map
const SUB_COLORS = {
  success: "text-[#16A34A]"
};

function StatCard({ label, value, sub, subType = "neutral" }) {
  const colorClass = SUB_COLORS[subType] || SUB_COLORS.neutral;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-1">
      <p className="text-xs text-[var(--color-text-muted)] font-medium">
        {label}
      </p>

      <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">
        {value}
      </p>

      {sub &&
        <p className={`text-xs font-medium ${colorClass}`}>
          {sub}
        </p>}
    </div>
  );
}

export default function ListingsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Listings"
        value="12"
        sub="+15% this quarter"
        subType="success"
      />

      <StatCard
        label="Listing Views"
        value="1331"
        sub="+2 this month"
        subType="success"
      />

      <StatCard
        label="Total Bookings"
        value="1601"
        sub="+8% from last month"
        subType="success"
      />

      <StatCard
        label="Avg. Rating"
        value="98%"
        sub="+0.3 from last month"
        subType="success"
      />
    </div>
  );
}

"use client";

import React from "react";
import Pagination from "@/components/shared/Pagination";
import { formatListingPrice } from "./listings/listingPrice";
import { LocationIcon, ImageIcon } from "@/icons";
import AvailabilityCell      from "./listings/AvailabilityCell";
import ListingStatusDropdown from "./listings/ListingStatusDropdown";
import ListingActionMenu     from "./listings/ListingActionMenu";

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function cap(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ─── Type badge ─────────────────────────────────────────────────────────────── */
const TYPE_COLORS = {
  adventure: "bg-blue-50 text-blue-600 border-blue-100",
  equipment: "bg-purple-50 text-purple-600 border-purple-100",
  places:    "bg-teal-50 text-teal-600 border-teal-100",
  events:    "bg-pink-50 text-pink-600 border-pink-100",
};

function TypeBadge({ type }) {
  if (!type || type === "—") return <span className="text-gray-300 text-xs">—</span>;
  const color = TYPE_COLORS[type.toLowerCase()] ?? "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold ${color}`}>
      {cap(type)}
    </span>
  );
}

/* ─── Category badge ─────────────────────────────────────────────────────────── */
function CategoryBadge({ category }) {
  if (!category || category === "—") return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F3F4F6] border border-gray-200 text-[10px] font-bold text-gray-500">
      {cap(category)}
    </span>
  );
}

/* ─── Table header style ─────────────────────────────────────────────────────── */
const thStyle = {
  fontFamily:    "var(--font-sofia-pro)",
  fontWeight:    600,
  fontSize:      "12px",
  lineHeight:    "21px",
  letterSpacing: "0px",
  color:         "#212121",
};

/* ─── Main export ────────────────────────────────────────────────────────────── */
export default function ListingsTable({
  data,
  currentPage = 1,
  totalPages  = 1,
  onPageChange,
  onStatusChange,
  onEdit,
  onDelete,
  onResumeDraft,
  onViewDetails,
}) {
  return (
    <div className="flex flex-col flex-1 justify-between">
      <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(224,224,224,1)" }}>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#F8F9FA]" style={{ borderBottom: "2px solid rgba(224,224,224,1)" }}>
              {["Activity", "Category", "Type", "Price", "Availability", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 uppercase whitespace-nowrap" style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400 font-medium">
                  No listings found.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50/60"
                  style={idx !== data.length - 1 ? { borderBottom: "1px solid rgba(224,224,224,1)" } : undefined}
                >
                  {/* Activity */}
                  <td className="px-5 py-3.5 min-w-[200px] max-w-[260px]">
                    <div className="flex items-center gap-3 text-left w-full">
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                        {item.image && (item.image.startsWith("http") || item.image.startsWith("blob:") || item.image.startsWith("data:")) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <ImageIcon size={14} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-text truncate leading-tight mb-0.5">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 truncate">
                          <LocationIcon />
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <CategoryBadge category={item.category} />
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <TypeBadge type={item.type} />
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs font-extrabold text-text">
                      {item.priceLabel ?? formatListingPrice(item.category, item.price)}
                    </span>
                  </td>

                  {/* Availability */}
                  <td className="px-5 py-3.5 min-w-[150px]">
                    <AvailabilityCell slots={item.slots || item.availability || []} />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <ListingStatusDropdown
                      status={item.status}
                      onStatusChange={(newStatus) => onStatusChange(item, newStatus)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <ListingActionMenu
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onResumeDraft={onResumeDraft}
                      onViewDetails={onViewDetails}
                      isLast={idx === data.length - 1}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

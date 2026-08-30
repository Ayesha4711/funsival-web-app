"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUser,
  clearSelectedAdminUser,
  selectSelectedAdminUser,
  selectSelectedAdminUserStatus,
} from "@/store/slices/adminSlice";

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
  host: "bg-blue-100 text-blue-700",
  user: "bg-gray-100 text-gray-600",
};

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[role] ?? ROLE_STYLES.user}`}>
      {role}
    </span>
  );
}

function resolveDisplayName(user) {
  const p = user?.providerProfile;
  if (p && (p.firstName || p.lastName)) {
    return [p.firstName, p.lastName].filter(Boolean).join(" ");
  }
  return user?.name || user?.email || "—";
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800 text-right">{value ?? "—"}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const userId = params?.userId;

  const user = useSelector(selectSelectedAdminUser);
  const status = useSelector(selectSelectedAdminUserStatus);

  useEffect(() => {
    if (userId) dispatch(fetchAdminUser(userId));
    return () => {
      dispatch(clearSelectedAdminUser());
    };
  }, [dispatch, userId]);

  const isLoading = status === "loading";

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 2xl:p-8 flex items-center justify-center">
        {isLoading ? (
          <div className="w-8 h-8 border-[3px] border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
        ) : (
          <p className="text-gray-400 font-medium text-sm">User not found.</p>
        )}
      </div>
    );
  }

  const displayName = resolveDisplayName(user);
  const stats = user.stats ?? {};
  const listingStats = stats.listings ?? {};
  const bookingStats = stats.bookings ?? {};
  const ratingStats = stats.rating ?? {};
  const stripe = user.stripeConnect ?? {};

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 2xl:p-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
        {/* Back */}
        <Link href="/admin/users" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 w-fit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Users
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          {user.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profileImage} alt="" className="w-16 h-16 rounded-full object-cover border border-gray-100 shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#EBF6F6] text-[#4AA7A7] flex items-center justify-center text-xl font-bold shrink-0">
              {displayName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              <RoleBadge role={user.role} />
              {user.isEmailVerified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verified</span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Unverified</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          </div>
        </div>

        {/* Stats (host/user activity) */}
        {/*
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Listings" value={listingStats.total ?? 0} />
          <StatCard label="Active Listings" value={listingStats.active ?? 0} />
          <StatCard label="Bookings as Host" value={bookingStats.asHost ?? 0} />
          <StatCard label="Bookings as Guest" value={bookingStats.asGuest ?? 0} />
        </div>
        */}

        <div className="flex flex-col gap-5">
          {/* Profile info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Profile</h2>
            <InfoRow label="Agency Name" value={user.agencyName} />
            <InfoRow label="Business Name" value={user.providerProfile?.businessName} />
            <InfoRow label="City" value={user.city} />
            <InfoRow label="Phone" value={user.phoneNumber} />
            <InfoRow label="2FA Enabled" value={user.twoFactorEnabled ? "Yes" : "No"} />
            <InfoRow label="Auth Providers" value={Array.isArray(user.authProviders) ? user.authProviders.join(", ") : "—"} />
            <InfoRow label="Joined" value={formatDate(user.createdAt)} />
            <InfoRow label="Last Updated" value={formatDate(user.updatedAt)} />
            {user.providerProfile?.bio && (
              <div className="pt-3 mt-1 border-t border-gray-50">
                <p className="text-sm text-gray-400 font-medium mb-1">Bio</p>
                <p className="text-sm text-gray-700">{user.providerProfile.bio}</p>
              </div>
            )}
          </div>

          {/* Rating + Stripe Connect */}
          {/*
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Rating</h2>
              <InfoRow label="Average" value={ratingStats.average != null ? `${ratingStats.average} ★` : "—"} />
              <InfoRow label="Reviews" value={ratingStats.count ?? 0} />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mt-4 mb-2">Listings Breakdown</h2>
              <InfoRow label="Active" value={listingStats.active ?? 0} />
              <InfoRow label="Inactive" value={listingStats.inactive ?? 0} />
              <InfoRow label="Draft" value={listingStats.draft ?? 0} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Stripe Connect</h2>
              <InfoRow label="Connected" value={stripe.connected ? "Yes" : "No"} />
              <InfoRow label="Charges Enabled" value={stripe.chargesEnabled ? "Yes" : "No"} />
              <InfoRow label="Payouts Enabled" value={stripe.payoutsEnabled ? "Yes" : "No"} />
              <InfoRow label="Details Submitted" value={stripe.detailsSubmitted ? "Yes" : "No"} />
              <InfoRow label="Onboarded At" value={formatDate(stripe.onboardedAt)} />
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}

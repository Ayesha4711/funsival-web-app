"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUsers,
  selectAdminUsers,
  selectAdminUsersTabs,
  selectAdminUsersPagination,
  selectAdminUsersStatus,
} from "@/store/slices/adminSlice";
import { fetchProfile, selectUser } from "@/store/slices/profileSlice";
import Pagination from "@/components/shared/Pagination";
import EditUserModal from "@/components/admin/EditUserModal";
import DeleteUserModal from "@/components/admin/DeleteUserModal";
import { EditIcon, TrashIcon } from "@/icons";

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
  host: "bg-blue-100 text-blue-700",
  user: "bg-gray-100 text-gray-600",
};

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[role] ?? ROLE_STYLES.user}`}>
      {role}
    </span>
  );
}

function resolveDisplayName(user) {
  const p = user.providerProfile;
  if (p && (p.firstName || p.lastName)) {
    return [p.firstName, p.lastName].filter(Boolean).join(" ");
  }
  return user.name || user.email || "—";
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminUsersPage() {
  const dispatch = useDispatch();

  const users = useSelector(selectAdminUsers);
  const tabs = useSelector(selectAdminUsersTabs);
  const pagination = useSelector(selectAdminUsersPagination);
  const fetchStatus = useSelector(selectAdminUsersStatus);
  const currentAdmin = useSelector(selectUser);

  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchDebounceRef = useRef(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const ROLE_TABS = [
    { key: "all", label: `All${tabs.all != null ? ` (${tabs.all})` : ""}` },
    { key: "user", label: `Users${tabs.user != null ? ` (${tabs.user})` : ""}` },
    { key: "host", label: `Hosts${tabs.host != null ? ` (${tabs.host})` : ""}` },
    { key: "admin", label: `Admins${tabs.admin != null ? ` (${tabs.admin})` : ""}` },
  ];

  const load = useCallback(() => {
    dispatch(fetchAdminUsers({
      role: activeTab === "all" ? undefined : activeTab,
      search: debouncedSearch || undefined,
      page,
      limit: 20,
    }));
  }, [dispatch, activeTab, debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!currentAdmin) dispatch(fetchProfile());
  }, [dispatch, currentAdmin]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const isLoading = fetchStatus === "loading";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 2xl:p-8">
      <div className="w-full flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl 2xl:text-3xl font-bold text-gray-900">Users</h1>

          <div className="relative">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, city…"
              className="pl-9 pr-4 py-2 w-64 sm:w-80 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#4AA7A7]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit flex-wrap">
          {ROLE_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === key ? "bg-[#4AA7A7] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-[3px] border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              </svg>
              <p className="text-gray-400 font-medium text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-240 border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["User", "Role", "City", "Phone", "Verified", "Joined", ""].map((h) => (
                      <th key={h} className="px-5 2xl:px-8 py-3 2xl:py-5 text-left text-xs 2xl:text-sm font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const displayName = resolveDisplayName(user);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* User */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          <div className="flex items-center gap-2.5">
                            {user.profileImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.profileImage} alt="" className="w-8 h-8 2xl:w-11 2xl:h-11 rounded-full object-cover shrink-0 border border-gray-100" />
                            ) : (
                              <div className="w-8 h-8 2xl:w-11 2xl:h-11 rounded-full bg-[#EBF6F6] text-[#4AA7A7] flex items-center justify-center text-xs 2xl:text-sm font-bold shrink-0">
                                {displayName?.[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm 2xl:text-base font-semibold text-gray-800 truncate max-w-40 2xl:max-w-56">
                                {displayName}
                              </p>
                              <p className="text-xs 2xl:text-sm text-gray-400 truncate max-w-40 2xl:max-w-56">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          <RoleBadge role={user.role} />
                        </td>

                        {/* City */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          <p className="text-sm 2xl:text-base text-gray-600">{user.city || "—"}</p>
                        </td>

                        {/* Phone */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5 whitespace-nowrap">
                          <p className="text-sm 2xl:text-base text-gray-600">{user.phoneNumber || "—"}</p>
                        </td>

                        {/* Verified */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          {user.isEmailVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Verified</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Unverified</span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5 whitespace-nowrap">
                          <p className="text-sm 2xl:text-base text-gray-500">{formatDate(user.createdAt)}</p>
                        </td>

                        {/* Actions */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          <div className="flex items-center gap-3 whitespace-nowrap">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="text-xs 2xl:text-sm font-bold text-[#4AA7A7] hover:underline"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => setEditingUser(user)}
                              className="flex items-center gap-1 text-xs 2xl:text-sm font-bold text-gray-500 hover:text-gray-700"
                              title="Edit user"
                            >
                              <EditIcon size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingUser(user)}
                              disabled={user.id === currentAdmin?.id}
                              className="flex items-center gap-1 text-xs 2xl:text-sm font-bold text-red-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              title={user.id === currentAdmin?.id ? "You cannot delete your own account" : "Delete user"}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          currentAdminId={currentAdmin?.id}
          onClose={() => setEditingUser(null)}
          onSaved={load}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          currentAdminId={currentAdmin?.id}
          onClose={() => setDeletingUser(null)}
          onDeleted={load}
        />
      )}
    </div>
  );
}

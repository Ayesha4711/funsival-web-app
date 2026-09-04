"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import AppFooter from "@/components/shared/AppFooter";
import Pagination from "@/components/shared/Pagination";
import { ListingCard } from "@/components/user-dashboard/UserExplorePage";
import {
  fetchWishlist,
  selectWishlistItems,
  selectWishlistPagination,
  selectWishlistStatus,
} from "@/store/slices/wishlistSlice";
import { ArrowLeftIcon as BackIcon } from "@/icons";

const ITEMS_PER_PAGE = 12;

export default function WatchlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const items = useSelector(selectWishlistItems);
  const pagination = useSelector(selectWishlistPagination);
  const status = useSelector(selectWishlistStatus);

  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(() => {
    dispatch(fetchWishlist({ page: currentPage, limit: ITEMS_PER_PAGE }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil((pagination?.total ?? 0) / ITEMS_PER_PAGE));
  const isLoading = status === "loading";

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 w-full">
        <div className="px-4 sm:px-6 lg:px-10 py-5 flex items-center gap-3">
          <button
            onClick={() => router.push("/user-dashboard/explore")}
            className="text-gray-900 hover:text-gray-600 transition-colors shrink-0"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Wishlist</h1>
        </div>
      </div>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-[3px] border-[#228E8A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {items.map((listing) => (
                <ListingCard key={listing._id || listing.id} listing={listing} />
              ))}
            </div>
            <div className="mt-6 sm:mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Image src="/images/No favorites.png" alt="No favorites" width={200} height={200} className="object-contain mb-5" />
            <p className="text-lg font-semibold text-gray-700 mb-1">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mb-6">Save listings you love and find them here anytime</p>
            <button
              onClick={() => router.push("/user-dashboard/explore")}
              className="px-6 py-2.5 bg-[#228E8A] text-white rounded-full text-sm font-semibold hover:bg-[#1d7a77] transition-colors"
            >
              Start Exploring
            </button>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

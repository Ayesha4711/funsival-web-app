import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async ({ page = 1, limit = 12 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/wishlist?page=${page}&limit=${limit}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchWishlistSummary = createAsyncThunk(
  "wishlist/fetchWishlistSummary",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/wishlist/summary");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (listingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/wishlist/${listingId}/toggle`);
      return { listingId, ...(data?.data ?? data) };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (listingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/wishlist/${listingId}`);
      return { listingId, ...(data?.data ?? data) };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (listingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/wishlist/${listingId}`);
      return { listingId, ...(data?.data ?? data) };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    pagination: { page: 1, limit: 12, total: 0 },
    status: "idle",
    error: null,

    summaryCount: 0,
    summaryListingIds: [],
    summaryStatus: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        const d = action.payload?.data ?? action.payload ?? {};
        state.items = Array.isArray(d.listings) ? d.listings : [];
        state.pagination = d.pagination ?? state.pagination;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // fetchWishlistSummary
      .addCase(fetchWishlistSummary.fulfilled, (state, action) => {
        state.summaryStatus = "succeeded";
        const d = action.payload?.data ?? action.payload ?? {};
        state.summaryCount = d.count ?? 0;
        state.summaryListingIds = Array.isArray(d.listingIds) ? d.listingIds : [];
      })
      .addCase(fetchWishlistSummary.pending, (state) => {
        state.summaryStatus = "loading";
      })
      .addCase(fetchWishlistSummary.rejected, (state) => {
        state.summaryStatus = "failed";
      })

      // toggleWishlist
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { listingId, isWishlisted } = action.payload;
        if (isWishlisted) {
          if (!state.summaryListingIds.includes(listingId)) {
            state.summaryListingIds.push(listingId);
            state.summaryCount += 1;
          }
        } else {
          if (state.summaryListingIds.includes(listingId)) {
            state.summaryListingIds = state.summaryListingIds.filter((id) => id !== listingId);
            state.summaryCount = Math.max(0, state.summaryCount - 1);
          }
          state.items = state.items.filter((item) => (item.id ?? item._id) !== listingId);
        }
      })

      // addToWishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const { listingId } = action.payload;
        if (!state.summaryListingIds.includes(listingId)) {
          state.summaryListingIds.push(listingId);
          state.summaryCount += 1;
        }
      })

      // removeFromWishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const { listingId } = action.payload;
        state.summaryListingIds = state.summaryListingIds.filter((id) => id !== listingId);
        state.summaryCount = Math.max(0, state.summaryCount - 1);
        state.items = state.items.filter((item) => (item.id ?? item._id) !== listingId);
      });
  },
});

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistPagination = (state) => state.wishlist.pagination;
export const selectWishlistStatus = (state) => state.wishlist.status;
export const selectWishlistError = (state) => state.wishlist.error;

export const selectWishlistSummaryCount = (state) => state.wishlist.summaryCount;
export const selectWishlistSummaryListingIds = (state) => state.wishlist.summaryListingIds;
export const selectWishlistSummaryStatus = (state) => state.wishlist.summaryStatus;
export const selectIsWishlisted = (listingId) => (state) =>
  state.wishlist.summaryListingIds.includes(listingId);

export default wishlistSlice.reducer;

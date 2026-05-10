import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchListings = createAsyncThunk(
  "listings/fetchListings",
  async ({ page = 1, limit = 10, category, search, city, minPrice, maxPrice, sort } = {}, { rejectWithValue }) => {
    try {
      const hasFilter =
        (category && category !== "All Categories") ||
        (search && search.trim()) ||
        (city && city.trim()) ||
        minPrice != null ||
        maxPrice != null ||
        sort;
      const params = new URLSearchParams({ page, limit });
      if (category && category !== "All Categories") params.set("category", category);
      if (search && search.trim()) params.set("search", search.trim());
      if (city && city.trim()) params.set("city", city.trim());
      if (minPrice != null) params.set("minPrice", minPrice);
      if (maxPrice != null) params.set("maxPrice", maxPrice);
      if (sort) params.set("sort", sort);
      const endpoint = hasFilter ? `/listings/browse?${params.toString()}` : `/listings?${params.toString()}`;
      const { data } = await axiosInstance.get(endpoint);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchListing = createAsyncThunk(
  "listings/fetchListing",
  async (listingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/listings/${listingId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const createListing = createAsyncThunk(
  "listings/createListing",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/listings", payload);
      return data;
    } catch (err) {
      // Preserve full response body so wizard can read errors object
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const uploadListingImages = createAsyncThunk(
  "listings/uploadListingImages",
  async (files, { rejectWithValue }) => {
    try {
      const fileList = Array.from(files ?? []).filter(Boolean);
      if (fileList.length === 0) {
        return rejectWithValue("At least one image is required.");
      }

      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append("images", file);
      });

      const { data } = await axiosInstance.post("/listings/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const updateListing = createAsyncThunk(
  "listings/updateListing",
  async ({ listingId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/listings/${listingId}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data ?? err.message);
    }
  }
);

export const deleteListing = createAsyncThunk(
  "listings/deleteListing",
  async (listingId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/listings/${listingId}`);
      return listingId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const saveDraft = createAsyncThunk(
  "listings/saveDraft",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/listings/draft", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchDraft = createAsyncThunk(
  "listings/fetchDraft",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/listings/draft");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const deleteDraft = createAsyncThunk(
  "listings/deleteDraft",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/listings/draft");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const listingsSlice = createSlice({
  name: "listings",
  initialState: {
    items: [],
    selectedListing: null,
    draft: null,
    pagination: { page: 1, limit: 10, total: 0 },
    status: "idle",
    draftStatus: "idle",
    error: null,
  },
  reducers: {
    setSelectedListing(state, action) {
      state.selectedListing = action.payload;
    },
    clearSelectedListing(state) {
      state.selectedListing = null;
    },
    clearListingsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.status = "succeeded";
        const listData = action.payload?.data;
        state.items = listData?.listings ?? (Array.isArray(listData) ? listData : []);
        state.pagination = listData?.pagination ?? action.payload?.pagination ?? state.pagination;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchListing.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchListing.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedListing = action.payload?.data ?? action.payload;
      })
      .addCase(fetchListing.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createListing.fulfilled, (state, action) => {
        const newListing = action.payload?.data ?? action.payload;
        if (newListing && Array.isArray(state.items)) state.items.unshift(newListing);
      })

      .addCase(updateListing.fulfilled, (state, action) => {
        const updated = action.payload?.data?.listing ?? action.payload?.data ?? action.payload;
        if (Array.isArray(state.items)) {
          const idx = state.items.findIndex((l) => l._id === updated?._id);
          if (idx !== -1) state.items[idx] = updated;
        }
        if (state.selectedListing?._id === updated?._id) {
          state.selectedListing = updated;
        }
      })

      .addCase(deleteListing.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l._id !== action.payload);
      })

      .addCase(saveDraft.fulfilled, (state, action) => {
        state.draft = action.payload;
      })
      .addCase(fetchDraft.fulfilled, (state, action) => {
        state.draft = action.payload;
      })
      .addCase(deleteDraft.fulfilled, (state) => {
        state.draft = null;
      });
  },
});

export const { setSelectedListing, clearSelectedListing, clearListingsError } =
  listingsSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectListings = (state) => state.listings.items;
export const selectSelectedListing = (state) => state.listings.selectedListing;
export const selectListingsDraft = (state) => state.listings.draft;
export const selectListingsPagination = (state) => state.listings.pagination;
export const selectListingsStatus = (state) => state.listings.status;
export const selectListingsError = (state) => state.listings.error;

export default listingsSlice.reducer;

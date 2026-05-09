import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchBrowseListings = createAsyncThunk(
  "activities/fetchBrowseListings",
  async ({ page = 1, limit = 10, category, type, search, city, minPrice, maxPrice, sort, date, rating, instantBook } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: page ?? 1, limit: limit ?? 10 });
      if (category) params.set("category", category);
      if (type) params.set("type", type);
      if (search) params.set("search", search);
      if (city) params.set("city", city);
      if (minPrice != null && minPrice !== '' && minPrice > 0) params.set("minPrice", String(minPrice));
      if (maxPrice != null && maxPrice !== '' && maxPrice < 5000) params.set("maxPrice", String(maxPrice));
      if (sort) params.set("sort", sort);
      if (date) params.set("date", date);
      if (rating != null) params.set("rating", String(rating));
      if (instantBook) params.set("instantBook", instantBook);

      console.log('API Request Params:', params.toString());
      const { data } = await axiosInstance.get(`/listings/browse?${params}`);
      console.log('API Response:', data);
      return data;
    } catch (err) {
      console.error('API Error:', err.response?.data ?? err.message);
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchBrowseListing = createAsyncThunk(
  "activities/fetchBrowseListing",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/listings/browse/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null));
      const params = new URLSearchParams({ page: page ?? 1, limit: limit ?? 10, ...cleanFilters }).toString();
      const { data } = await axiosInstance.get(`/listings/browse?${params}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchActivity = createAsyncThunk(
  "activities/fetchActivity",
  async (activityId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/listings/${activityId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const activitiesSlice = createSlice({
  name: "activities",
  initialState: {
    items: [],
    selectedActivity: null,
    selectedActivityStatus: "idle",
    filters: {},
    pagination: { page: 1, limit: 10, total: 0 },
    status: "idle",   // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {};
    },
    setSelectedActivity(state, action) {
      state.selectedActivity = action.payload;
    },
    clearSelectedActivity(state) {
      state.selectedActivity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBrowseListings
      .addCase(fetchBrowseListings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBrowseListings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.data?.listings ?? [];
        state.pagination = action.payload?.data?.pagination ?? state.pagination;
      })
      .addCase(fetchBrowseListings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // fetchActivities
      .addCase(fetchActivities.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.data?.listings ?? [];
        state.pagination = action.payload?.data?.pagination ?? state.pagination;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // fetchActivity
      .addCase(fetchActivity.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchActivity.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedActivity = action.payload?.data ?? action.payload;
      })
      .addCase(fetchActivity.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // fetchBrowseListing (single listing from browse)
      .addCase(fetchBrowseListing.pending, (state) => {
        state.selectedActivityStatus = "loading";
        state.error = null;
      })
      .addCase(fetchBrowseListing.fulfilled, (state, action) => {
        state.selectedActivityStatus = "succeeded";
        state.selectedActivity = action.payload?.data?.listing ?? action.payload?.data ?? action.payload;
      })
      .addCase(fetchBrowseListing.rejected, (state, action) => {
        state.selectedActivityStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedActivity,
  clearSelectedActivity,
} = activitiesSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectActivities = (state) => state.activities.items;
export const selectSelectedActivity = (state) => state.activities.selectedActivity;
export const selectSelectedActivityStatus = (state) => state.activities.selectedActivityStatus;
export const selectActivityFilters = (state) => state.activities.filters;
export const selectActivitiesPagination = (state) => state.activities.pagination;
export const selectActivitiesStatus = (state) => state.activities.status;
export const selectActivitiesError = (state) => state.activities.error;

export default activitiesSlice.reducer;

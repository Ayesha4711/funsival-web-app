import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchBrowseListings = createAsyncThunk(
  "activities/fetchBrowseListings",
  async ({ page = 1, limit = 10, category, type, search, city, location, minPrice, maxPrice, sort, date, from, until, rating, instantBook } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page: page ?? 1, limit: limit ?? 10 });
      if (category) params.set("category", category);
      if (type) params.set("type", type);
      if (search) params.set("search", search);
      if (city) params.set("city", city);
      if (location) params.set("location", location);
      if (minPrice != null && minPrice !== '' && minPrice > 0) params.set("minPrice", String(minPrice));
      if (maxPrice != null && maxPrice !== '' && maxPrice < 5000) params.set("maxPrice", String(maxPrice));
      if (sort) params.set("sort", sort);
      if (date) params.set("date", date);
      if (from) params.set("from", from);
      if (until) params.set("until", until);
      if (rating != null) params.set("rating", String(rating));
      if (instantBook) params.set("instantBook", instantBook);

      const { data } = await axiosInstance.get(`/listings/browse?${params}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchBrowseTypes = createAsyncThunk(
  "activities/fetchBrowseTypes",
  async ({ category, limit, location, from, until } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (limit) params.set("limit", String(limit));
      if (location) params.set("location", location);
      if (from) params.set("from", from);
      if (until) params.set("until", until);
      const qs = params.toString();
      const { data } = await axiosInstance.get(`/listings/browse/types${qs ? `?${qs}` : ""}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchBrowseDestinations = createAsyncThunk(
  "activities/fetchBrowseDestinations",
  async ({ limit, location, from, until } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (limit) params.set("limit", String(limit));
      if (location) params.set("location", location);
      if (from) params.set("from", from);
      if (until) params.set("until", until);
      const qs = params.toString();
      const { data } = await axiosInstance.get(`/listings/browse/destinations${qs ? `?${qs}` : ""}`);
      return data;
    } catch (err) {
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
    hostCache: {},
    selectedActivity: null,
    selectedActivityStatus: "idle",
    filters: {},
    pagination: { page: 1, limit: 10, total: 0 },
    status: "idle",   // "idle" | "loading" | "succeeded" | "failed"
    error: null,
    browseTypes: [],
    browseTypesStatus: "idle",
    browseDestinations: [],
    browseDestinationsStatus: "idle",
    // Landing page hero search — filters Browse by Adventure/Destination
    // in place rather than navigating away.
    landingSearch: { location: "", category: null, from: "", until: "" },
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
    setLandingSearch(state, action) {
      state.landingSearch = { ...state.landingSearch, ...action.payload };
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
        const listings = action.payload?.data?.listings ?? [];
        state.items = listings;
        state.pagination = action.payload?.data?.pagination ?? state.pagination;
        // Cache host data by listing id so detail page can use it on cold load
        listings.forEach((l) => {
          if (l.host && (l.id ?? l._id)) state.hostCache[l.id ?? l._id] = l.host;
        });
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
        const listing = action.payload?.data?.listing ?? action.payload?.data ?? action.payload;
        // If the single-listing endpoint didn't populate complete host data (missing profileImage or name differs from agencyName),
        // fall back to the cached host data from browse list
        const currentHost = listing?.host;
        const hasCompleteHost = currentHost &&
                                typeof currentHost === "object" &&
                                currentHost.id &&
                                currentHost.profileImage &&
                                currentHost.name !== currentHost.agencyName;

        if (!hasCompleteHost) {
          const id = listing?.id ?? listing?._id;
          const cachedHost = state.hostCache[id];
          // Only use cached host if it has profileImage (more complete data)
          if (cachedHost && cachedHost.profileImage) {
            listing.host = cachedHost;
          }
        }
        // Cache this listing's host if it has complete data
        if (listing?.host?.id && listing?.host?.profileImage) {
          const id = listing.id ?? listing._id;
          if (id) state.hostCache[id] = listing.host;
        }
        state.selectedActivity = listing;
      })
      .addCase(fetchBrowseListing.rejected, (state, action) => {
        state.selectedActivityStatus = "failed";
        state.error = action.payload;
      })
      // fetchBrowseTypes
      .addCase(fetchBrowseTypes.pending, (state) => {
        state.browseTypesStatus = "loading";
      })
      .addCase(fetchBrowseTypes.fulfilled, (state, action) => {
        state.browseTypesStatus = "succeeded";
        state.browseTypes = action.payload?.data?.types ?? action.payload?.data ?? [];
      })
      .addCase(fetchBrowseTypes.rejected, (state) => {
        state.browseTypesStatus = "failed";
      })
      // fetchBrowseDestinations
      .addCase(fetchBrowseDestinations.pending, (state) => {
        state.browseDestinationsStatus = "loading";
      })
      .addCase(fetchBrowseDestinations.fulfilled, (state, action) => {
        state.browseDestinationsStatus = "succeeded";
        state.browseDestinations = action.payload?.data?.destinations ?? action.payload?.data ?? [];
      })
      .addCase(fetchBrowseDestinations.rejected, (state) => {
        state.browseDestinationsStatus = "failed";
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedActivity,
  clearSelectedActivity,
  setLandingSearch,
} = activitiesSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectActivities = (state) => state.activities.items;
export const selectHostCache = (state) => state.activities.hostCache;
export const selectSelectedActivity = (state) => state.activities.selectedActivity;
export const selectSelectedActivityStatus = (state) => state.activities.selectedActivityStatus;
export const selectActivityFilters = (state) => state.activities.filters;
export const selectActivitiesPagination = (state) => state.activities.pagination;
export const selectActivitiesStatus = (state) => state.activities.status;
export const selectActivitiesError = (state) => state.activities.error;

export const selectBrowseTypes = (state) => state.activities.browseTypes;
export const selectBrowseTypesStatus = (state) => state.activities.browseTypesStatus;
export const selectBrowseDestinations = (state) => state.activities.browseDestinations;
export const selectBrowseDestinationsStatus = (state) => state.activities.browseDestinationsStatus;
export const selectLandingSearch = (state) => state.activities.landingSearch;

export default activitiesSlice.reducer;

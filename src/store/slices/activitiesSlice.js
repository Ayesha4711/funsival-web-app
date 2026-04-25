import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async ({ page = 1, limit = 10, filters = {} } = {}, { rejectWithValue }) => {
    try {
      // TODO: replace with axiosInstance call
      // const params = new URLSearchParams({ page, limit, ...filters }).toString();
      // const { data } = await axiosInstance.get(`/api/v1/activities?${params}`);
      // return data;
      throw new Error("Not implemented — wire up axiosInstance when ready");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchActivity = createAsyncThunk(
  "activities/fetchActivity",
  async (activityId, { rejectWithValue }) => {
    try {
      // TODO: replace with axiosInstance call
      // const { data } = await axiosInstance.get(`/api/v1/activities/${activityId}`);
      // return data;
      throw new Error("Not implemented — wire up axiosInstance when ready");
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
      // fetchActivities
      .addCase(fetchActivities.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.data ?? [];
        state.pagination = action.payload?.pagination ?? state.pagination;
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
        state.selectedActivity = action.payload;
      })
      .addCase(fetchActivity.rejected, (state, action) => {
        state.status = "failed";
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
export const selectActivityFilters = (state) => state.activities.filters;
export const selectActivitiesPagination = (state) => state.activities.pagination;
export const selectActivitiesStatus = (state) => state.activities.status;
export const selectActivitiesError = (state) => state.activities.error;

export default activitiesSlice.reducer;

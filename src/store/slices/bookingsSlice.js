import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/bookings?page=${page}&limit=${limit}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchHostBookings = createAsyncThunk(
  "bookings/fetchHostBookings",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/bookings/host?page=${page}&limit=${limit}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchBooking = createAsyncThunk(
  "bookings/fetchBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/bookings/${bookingId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/bookings", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "bookings/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const bookingsSlice = createSlice({
  name: "bookings",
  initialState: {
    // user's own bookings
    items: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    status: "idle",
    // host's incoming bookings
    hostItems: [],
    hostPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    hostStatus: "idle",
    // shared
    selectedBooking: null,
    cancelStatus: "idle",
    error: null,
    hostError: null,
  },
  reducers: {
    setSelectedBooking(state, action) {
      state.selectedBooking = action.payload;
    },
    clearSelectedBooking(state) {
      state.selectedBooking = null;
    },
    clearBookingsError(state) {
      state.error = null;
      state.hostError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBookings (user)
      .addCase(fetchBookings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.data?.bookings ?? [];
        state.pagination = action.payload?.data?.pagination ?? state.pagination;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // fetchHostBookings (host)
      .addCase(fetchHostBookings.pending, (state) => {
        state.hostStatus = "loading";
        state.hostError = null;
      })
      .addCase(fetchHostBookings.fulfilled, (state, action) => {
        state.hostStatus = "succeeded";
        state.hostItems = action.payload?.data?.bookings ?? [];
        state.hostPagination = action.payload?.data?.pagination ?? state.hostPagination;
      })
      .addCase(fetchHostBookings.rejected, (state, action) => {
        state.hostStatus = "failed";
        state.hostError = action.payload;
      })
      // fetchBooking
      .addCase(fetchBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedBooking = action.payload?.data ?? action.payload;
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // createBooking
      .addCase(createBooking.fulfilled, (state, action) => {
        const booking = action.payload?.data ?? action.payload;
        if (booking) state.items.unshift(booking);
      })
      // cancelBooking — update in both lists
      .addCase(cancelBooking.pending, (state) => {
        state.cancelStatus = "loading";
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelStatus = "idle";
        const updated = action.payload?.data ?? action.payload;
        if (!updated) return;
        const userIdx = state.items.findIndex((b) => b.id === updated.id);
        if (userIdx !== -1) state.items[userIdx] = updated;
        const hostIdx = state.hostItems.findIndex((b) => b.id === updated.id);
        if (hostIdx !== -1) state.hostItems[hostIdx] = updated;
        if (state.selectedBooking?.id === updated.id) {
          state.selectedBooking = updated;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelStatus = "idle";
        state.error = action.payload;
      });
  },
});

export const { setSelectedBooking, clearSelectedBooking, clearBookingsError } =
  bookingsSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectBookings = (state) => state.bookings.items;
export const selectBookingsPagination = (state) => state.bookings.pagination;
export const selectBookingsStatus = (state) => state.bookings.status;
export const selectBookingsError = (state) => state.bookings.error;

export const selectHostBookings = (state) => state.bookings.hostItems;
export const selectHostBookingsPagination = (state) => state.bookings.hostPagination;
export const selectHostBookingsStatus = (state) => state.bookings.hostStatus;
export const selectHostBookingsError = (state) => state.bookings.hostError;

export const selectSelectedBooking = (state) => state.bookings.selectedBooking;
export const selectBookingsCancelStatus = (state) => state.bookings.cancelStatus;

export default bookingsSlice.reducer;

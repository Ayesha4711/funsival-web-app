import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      // TODO: replace with axiosInstance call
      // const { data } = await axiosInstance.get(`/bookings?page=${page}&limit=${limit}`);
      // return data;
      throw new Error("Not implemented — wire up axiosInstance when ready");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchBooking = createAsyncThunk(
  "bookings/fetchBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      // TODO: replace with axiosInstance call
      // const { data } = await axiosInstance.get(`/bookings/${bookingId}`);
      // return data;
      throw new Error("Not implemented — wire up axiosInstance when ready");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (payload, { rejectWithValue }) => {
    try {
      // TODO: replace with axiosInstance call
      // const { data } = await axiosInstance.post("/api/v1/bookings", payload);
      // return data;
      throw new Error("Not implemented — wire up axiosInstance when ready");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "bookings/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      // TODO: replace with axiosInstance call
      // const { data } = await axiosInstance.patch(`/bookings/${bookingId}/cancel`);
      // return data;
      throw new Error("Not implemented — wire up axiosInstance when ready");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const bookingsSlice = createSlice({
  name: "bookings",
  initialState: {
    items: [],
    selectedBooking: null,
    pagination: { page: 1, limit: 10, total: 0 },
    status: "idle",   // "idle" | "loading" | "succeeded" | "failed"
    error: null,
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
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBookings
      .addCase(fetchBookings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.data ?? [];
        state.pagination = action.payload?.pagination ?? state.pagination;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // fetchBooking
      .addCase(fetchBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedBooking = action.payload;
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // createBooking
      .addCase(createBooking.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // cancelBooking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b._id === action.payload?._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selectedBooking?._id === action.payload?._id) {
          state.selectedBooking = action.payload;
        }
      });
  },
});

export const { setSelectedBooking, clearSelectedBooking, clearBookingsError } =
  bookingsSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectBookings = (state) => state.bookings.items;
export const selectSelectedBooking = (state) => state.bookings.selectedBooking;
export const selectBookingsPagination = (state) => state.bookings.pagination;
export const selectBookingsStatus = (state) => state.bookings.status;
export const selectBookingsError = (state) => state.bookings.error;

export default bookingsSlice.reducer;

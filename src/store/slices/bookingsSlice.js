import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async ({ tab = "all", page = 1, limit = 10 } = {}, { rejectWithValue, signal }) => {
    try {
      const { data } = await axiosInstance.get("/bookings", { params: { tab, page, limit }, signal });
      return data;
    } catch (err) {
      if (err?.code === "ERR_CANCELED") throw err;
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchHostBookings = createAsyncThunk(
  "bookings/fetchHostBookings",
  async ({ tab = "all", search, date, page = 1, limit = 10 } = {}, { rejectWithValue, signal }) => {
    try {
      const params = { tab, page, limit };
      if (search) params.search = search;
      if (date) params.date = date;
      const { data } = await axiosInstance.get("/bookings/host", { params, signal });
      return data;
    } catch (err) {
      if (err?.code === "ERR_CANCELED") throw err;
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchHostBookingStats = createAsyncThunk(
  "bookings/fetchHostBookingStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/bookings/host/stats");
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
      const { data } = await axiosInstance.post("/bookings/", payload);
      return data;
    } catch (err) {
      const responseData = err.response?.data;
      return rejectWithValue({
        message: responseData?.message ?? err.message,
        errors: responseData?.errors ?? null,
        details: responseData?.details ?? null,
        status: err.response?.status ?? null,
      });
    }
  }
);

export const quoteBooking = createAsyncThunk(
  "bookings/quoteBooking",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/bookings/quote", payload);
      return data;
    } catch (err) {
      const responseData = err.response?.data;
      return rejectWithValue({
        message: responseData?.message ?? err.message,
        errors: responseData?.errors ?? null,
        details: responseData?.details ?? null,
        status: err.response?.status ?? null,
      });
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

// Host accepts a booking request → captures payment
export const acceptBooking = createAsyncThunk(
  "bookings/acceptBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/bookings/${bookingId}/accept`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// Host declines a booking request → voids authorization
export const declineBooking = createAsyncThunk(
  "bookings/declineBooking",
  async ({ bookingId, reason } = {}, { rejectWithValue }) => {
    try {
      const body = reason ? { reason } : {};
      const { data } = await axiosInstance.patch(`/bookings/${bookingId}/decline`, body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// Re-create a Stripe Checkout session for an existing booking
export const recreateCheckout = createAsyncThunk(
  "bookings/recreateCheckout",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/payments/bookings/${bookingId}/checkout`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Refund request thunks ────────────────────────────────────────────────────

export const submitRefundRequest = createAsyncThunk(
  "bookings/submitRefundRequest",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/bookings/${bookingId}/refund-request`, { reason });
      return { bookingId, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchRefundRequest = createAsyncThunk(
  "bookings/fetchRefundRequest",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/bookings/${bookingId}/refund-request`);
      return { bookingId, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const withdrawRefundRequest = createAsyncThunk(
  "bookings/withdrawRefundRequest",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/bookings/${bookingId}/refund-request`);
      return { bookingId, ...data };
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
    filters: { tab: "all", counts: { all: 0, in_progress: 0, completed: 0, cancelled: 0 } },
    status: "idle",
    // host's incoming bookings
    hostItems: [],
    hostPagination: { page: 1, limit: 10, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    hostFilters: { tab: "all", search: "", date: "", counts: { all: 0, upcoming: 0, completed: 0, cancelled: 0 } },
    hostStatus: "idle",
    // host's dashboard stat cards
    hostStats: null,
    hostStatsStatus: "idle",
    hostStatsError: null,
    // shared
    selectedBooking: null,
    cancelStatus: "idle",
    acceptStatus: "idle",
    declineStatus: "idle",
    error: null,
    hostError: null,
// refund requests keyed by bookingId
    refundRequests: {},
    refundRequestStatus: "idle",
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
        state.filters = action.payload?.data?.filters ?? state.filters;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        if (action.meta.aborted) return;
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
        state.hostFilters = action.payload?.data?.filters ?? state.hostFilters;
      })
      .addCase(fetchHostBookings.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.hostStatus = "failed";
        state.hostError = action.payload;
      })
      // fetchHostBookingStats
      .addCase(fetchHostBookingStats.pending, (state) => {
        state.hostStatsStatus = "loading";
        state.hostStatsError = null;
      })
      .addCase(fetchHostBookingStats.fulfilled, (state, action) => {
        state.hostStatsStatus = "succeeded";
        state.hostStats = action.payload?.data ?? null;
      })
      .addCase(fetchHostBookingStats.rejected, (state, action) => {
        state.hostStatsStatus = "failed";
        state.hostStatsError = action.payload;
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
      // createBooking — response now includes { booking, checkout }
      .addCase(createBooking.fulfilled, (state, action) => {
        const d = action.payload?.data;
        const booking = d?.booking ?? action.payload?.data ?? action.payload;
        if (booking?.id) state.items.unshift(booking);
      })
// cancelBooking — update in both lists
      .addCase(cancelBooking.pending, (state) => {
        state.cancelStatus = "loading";
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelStatus = "idle";
        const updated = action.payload?.data?.booking ?? action.payload?.data ?? action.payload;
        if (!updated) return;
        const userIdx = state.items.findIndex((b) => b.id === updated.id);
        if (userIdx !== -1) state.items[userIdx] = updated;
        const hostIdx = state.hostItems.findIndex((b) => b.id === updated.id);
        if (hostIdx !== -1) state.hostItems[hostIdx] = updated;
        if (state.selectedBooking?.id === updated.id) state.selectedBooking = updated;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelStatus = "idle";
        state.error = action.payload;
      })

      // acceptBooking
      .addCase(acceptBooking.pending, (state) => {
        state.acceptStatus = "loading";
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.acceptStatus = "idle";
        const updated = action.payload?.data?.booking ?? action.payload?.data ?? action.payload;
        if (!updated) return;
        const idx = state.hostItems.findIndex((b) => b.id === updated.id);
        if (idx !== -1) state.hostItems[idx] = updated;
        if (state.selectedBooking?.id === updated.id) state.selectedBooking = updated;
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.acceptStatus = "idle";
        state.error = action.payload;
      })

      // declineBooking
      .addCase(declineBooking.pending, (state) => {
        state.declineStatus = "loading";
      })
      .addCase(declineBooking.fulfilled, (state, action) => {
        state.declineStatus = "idle";
        const updated = action.payload?.data?.booking ?? action.payload?.data ?? action.payload;
        if (!updated) return;
        const idx = state.hostItems.findIndex((b) => b.id === updated.id);
        if (idx !== -1) state.hostItems[idx] = updated;
        if (state.selectedBooking?.id === updated.id) state.selectedBooking = updated;
      })
      .addCase(declineBooking.rejected, (state, action) => {
        state.declineStatus = "idle";
        state.error = action.payload;
      })

      // submitRefundRequest
      .addCase(submitRefundRequest.pending, (state) => {
        state.refundRequestStatus = "loading";
      })
      .addCase(submitRefundRequest.fulfilled, (state, action) => {
        state.refundRequestStatus = "idle";
        const { bookingId } = action.payload;
        const req = action.payload?.data?.refundRequest ?? null;
        if (bookingId && req) state.refundRequests[bookingId] = req;
      })
      .addCase(submitRefundRequest.rejected, (state) => {
        state.refundRequestStatus = "idle";
      })

      // fetchRefundRequest
      .addCase(fetchRefundRequest.fulfilled, (state, action) => {
        const { bookingId } = action.payload;
        const req = action.payload?.data?.refundRequest ?? action.payload?.data ?? null;
        if (bookingId) state.refundRequests[bookingId] = req;
      })

      // withdrawRefundRequest
      .addCase(withdrawRefundRequest.pending, (state) => {
        state.refundRequestStatus = "loading";
      })
      .addCase(withdrawRefundRequest.fulfilled, (state, action) => {
        state.refundRequestStatus = "idle";
        const { bookingId } = action.payload;
        const req = action.payload?.data?.refundRequest ?? null;
        if (bookingId) state.refundRequests[bookingId] = req;
      })
      .addCase(withdrawRefundRequest.rejected, (state) => {
        state.refundRequestStatus = "idle";
      });
  },
});

export const { setSelectedBooking, clearSelectedBooking, clearBookingsError } =
  bookingsSlice.actions;

export const selectRefundRequest = (bookingId) => (state) =>
  state.bookings.refundRequests[bookingId] ?? null;
export const selectRefundRequestStatus = (state) => state.bookings.refundRequestStatus;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectBookings = (state) => state.bookings.items;
export const selectBookingsPagination = (state) => state.bookings.pagination;
export const selectBookingsFilters = (state) => state.bookings.filters;
export const selectBookingsStatus = (state) => state.bookings.status;
export const selectBookingsError = (state) => state.bookings.error;

export const selectHostBookings = (state) => state.bookings.hostItems;
export const selectHostBookingsPagination = (state) => state.bookings.hostPagination;
export const selectHostBookingsFilters = (state) => state.bookings.hostFilters;
export const selectHostBookingsStatus = (state) => state.bookings.hostStatus;
export const selectHostBookingsError = (state) => state.bookings.hostError;

export const selectHostBookingStats = (state) => state.bookings.hostStats;
export const selectHostBookingStatsStatus = (state) => state.bookings.hostStatsStatus;
export const selectHostBookingStatsError = (state) => state.bookings.hostStatsError;

export const selectSelectedBooking = (state) => state.bookings.selectedBooking;
export const selectBookingsCancelStatus = (state) => state.bookings.cancelStatus;
export const selectBookingsAcceptStatus = (state) => state.bookings.acceptStatus;
export const selectBookingsDeclineStatus = (state) => state.bookings.declineStatus;

export default bookingsSlice.reducer;

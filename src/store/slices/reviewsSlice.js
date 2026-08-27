import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

export const fetchBookingReviewContext = createAsyncThunk(
  "reviews/fetchBookingReviewContext",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/reviews/bookings/${bookingId}/me`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchListingReviews = createAsyncThunk(
  "reviews/fetchListingReviews",
  async ({ listingId, page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/reviews/listings/${listingId}?page=${page}&limit=${limit}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const submitReview = createAsyncThunk(
  "reviews/submitReview",
  async ({ bookingId, overallRating, accuracy, quality, communication, value, comment }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/reviews/bookings/${bookingId}`, {
        overallRating,
        accuracy,
        quality,
        communication,
        value,
        comment,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/reviews/bookings/${bookingId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState: {
    context: null,         // data from GET /reviews/bookings/:id/me
    contextLoading: false,
    contextError: null,
    submitLoading: false,
    submitError: null,
    deleteLoading: false,
    deleteError: null,

    listingReviews: [],
    listingReviewsSummary: null,
    listingReviewsPagination: { page: 1, limit: 5, total: 0 },
    listingReviewsStatus: "idle",
    listingReviewsError: null,
  },
  reducers: {
    clearReviewContext(state) {
      state.context = null;
      state.contextError = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingReviewContext.pending, (state) => {
        state.contextLoading = true;
        state.contextError = null;
        state.context = null;
      })
      .addCase(fetchBookingReviewContext.fulfilled, (state, action) => {
        state.contextLoading = false;
        state.context = action.payload?.data ?? action.payload;
      })
      .addCase(fetchBookingReviewContext.rejected, (state, action) => {
        state.contextLoading = false;
        state.contextError = action.payload;
      })

      .addCase(submitReview.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.context = action.payload?.data ?? action.payload;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })

      .addCase(deleteReview.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.context = action.payload?.data ?? action.payload;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })

      .addCase(fetchListingReviews.pending, (state) => {
        state.listingReviewsStatus = "loading";
        state.listingReviewsError = null;
      })
      .addCase(fetchListingReviews.fulfilled, (state, action) => {
        state.listingReviewsStatus = "succeeded";
        const d = action.payload?.data ?? action.payload ?? {};
        state.listingReviews = Array.isArray(d.reviews) ? d.reviews : [];
        state.listingReviewsSummary = d.summary ?? null;
        state.listingReviewsPagination = d.pagination ?? state.listingReviewsPagination;
      })
      .addCase(fetchListingReviews.rejected, (state, action) => {
        state.listingReviewsStatus = "failed";
        state.listingReviewsError = action.payload;
      });
  },
});

export const { clearReviewContext } = reviewsSlice.actions;

export const selectReviewContext    = (state) => state.reviews.context;
export const selectReviewContextLoading = (state) => state.reviews.contextLoading;
export const selectReviewContextError   = (state) => state.reviews.contextError;
export const selectReviewSubmitLoading  = (state) => state.reviews.submitLoading;
export const selectReviewSubmitError    = (state) => state.reviews.submitError;
export const selectReviewDeleteLoading  = (state) => state.reviews.deleteLoading;
export const selectReviewDeleteError    = (state) => state.reviews.deleteError;

export const selectListingReviews = (state) => state.reviews.listingReviews;
export const selectListingReviewsSummary = (state) => state.reviews.listingReviewsSummary;
export const selectListingReviewsPagination = (state) => state.reviews.listingReviewsPagination;
export const selectListingReviewsStatus = (state) => state.reviews.listingReviewsStatus;
export const selectListingReviewsError = (state) => state.reviews.listingReviewsError;

export default reviewsSlice.reducer;

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

const reviewsSlice = createSlice({
  name: "reviews",
  initialState: {
    context: null,         // data from GET /reviews/bookings/:id/me
    contextLoading: false,
    contextError: null,
    submitLoading: false,
    submitError: null,
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
      .addCase(submitReview.fulfilled, (state) => {
        state.submitLoading = false;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const { clearReviewContext } = reviewsSlice.actions;

export const selectReviewContext    = (state) => state.reviews.context;
export const selectReviewContextLoading = (state) => state.reviews.contextLoading;
export const selectReviewContextError   = (state) => state.reviews.contextError;
export const selectReviewSubmitLoading  = (state) => state.reviews.submitLoading;
export const selectReviewSubmitError    = (state) => state.reviews.submitError;

export default reviewsSlice.reducer;

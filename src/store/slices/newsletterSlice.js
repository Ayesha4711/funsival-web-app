import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

export const subscribeNewsletter = createAsyncThunk(
  "newsletter/subscribe",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/newsletter/subscribe", { email });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const unsubscribeNewsletter = createAsyncThunk(
  "newsletter/unsubscribe",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/newsletter/unsubscribe", { email });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

const newsletterSlice = createSlice({
  name: "newsletter",
  initialState: {
    subscribeStatus: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    resetSubscribeStatus(state) {
      state.subscribeStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeNewsletter.pending, (state) => {
        state.subscribeStatus = "loading";
        state.error = null;
      })
      .addCase(subscribeNewsletter.fulfilled, (state) => {
        state.subscribeStatus = "succeeded";
      })
      .addCase(subscribeNewsletter.rejected, (state, action) => {
        state.subscribeStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetSubscribeStatus } = newsletterSlice.actions;

export const selectNewsletterSubscribeStatus = (state) => state.newsletter.subscribeStatus;
export const selectNewsletterError = (state) => state.newsletter.error;

export default newsletterSlice.reducer;

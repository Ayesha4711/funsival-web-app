import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

export const fetchFaqs = createAsyncThunk(
  "faqs/fetchFaqs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/faqs");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().faqs;
      return status !== "loading" && status !== "succeeded";
    },
  }
);

const faqsSlice = createSlice({
  name: "faqs",
  initialState: {
    items: [],
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.data?.faqs ?? action.payload?.data ?? [];
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const selectFaqs = (state) => state.faqs.items;
export const selectFaqsStatus = (state) => state.faqs.status;
export const selectFaqsError = (state) => state.faqs.error;

export default faqsSlice.reducer;

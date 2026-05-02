import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/auth/profile");
      return data?.data?.user ?? null;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.message
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch("/auth/profile", payload);
      return data?.data?.user ?? null;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.message
      );
    }
  }
);

export const updateProviderProfile = createAsyncThunk(
  "profile/updateProviderProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const safePayload = { ...payload };
      if (safePayload.profileImage?.startsWith?.("data:")) {
        delete safePayload.profileImage;
      }
      const { data } = await axiosInstance.patch("/users/provider-profile", safePayload);
      return data?.data?.user ?? data?.data ?? null;
    } catch (err) {
      const res = err.response?.data;
      return rejectWithValue(res ?? err.message);
    }
  }
);

export const savePreferences = createAsyncThunk(
  "profile/savePreferences",
  async (preferences, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/users/preferences", preferences);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.message
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: null,
    status: "idle",   // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    setProfile(state, action) {
      state.user = action.payload;
    },
    clearProfile(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(updateProviderProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProviderProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProviderProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(savePreferences.fulfilled, (state, action) => {
        if (state.user) {
          state.user.preferences = action.payload;
        }
      });
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectUser = (state) => state.profile.user;
export const selectProfileStatus = (state) => state.profile.status;
export const selectProfileError = (state) => state.profile.error;

export default profileSlice.reducer;

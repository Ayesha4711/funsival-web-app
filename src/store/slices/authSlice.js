import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        "/auth/login",
        credentials
      );
      const token =
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        data?.data?.token ??
        data?.data?.accessToken;
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("auth-token", token);
      }
      return { token, data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.response?.data?.error ?? err.message
      );
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/google", payload);
      const token = data?.token ?? data?.accessToken ?? data?.data?.token;
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("auth-token", token);
      }
      return { token, data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.response?.data?.error ?? err.message
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        "/auth/signup/user",
        payload
      );
      const token =
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        data?.data?.token ??
        data?.data?.accessToken;
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("auth-token", token);
      }
      return { token, data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.response?.data?.error ?? err.message
      );
    }
  }
);

export const signupHost = createAsyncThunk(
  "auth/signupHost",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        "/auth/signup/host",
        payload
      );
      const token =
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        data?.data?.token ??
        data?.data?.accessToken;
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("auth-token", token);
      }
      return { token, data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.response?.data?.error ?? err.message
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/auth/verify-email", {
        email,
        code
      });
      const token =
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        data?.data?.token ??
        data?.data?.accessToken;
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("auth-token", token);
      }
      return { token, data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.response?.data?.error ?? err.message
      );
    }
  }
);

export const resendVerificationCode = createAsyncThunk(
  "auth/resendVerificationCode",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        "/auth/resend-verification-code",
        { email }
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? err.response?.data?.error ?? err.message
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
        document.cookie = "auth-token=; Max-Age=0; path=/";
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    clearAuth(state) {
      state.token = null;
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.status = "loading";
      state.error = null;
    };
    const setFailed = (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    };

    builder
      .addCase(loginUser.pending, setLoading)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload?.token ?? null;
      })
      .addCase(loginUser.rejected, setFailed)

      .addCase(loginWithGoogle.pending, setLoading)
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload?.token ?? null;
      })
      .addCase(loginWithGoogle.rejected, setFailed)

      .addCase(signupUser.pending, setLoading)
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload?.token ?? null;
      })
      .addCase(signupUser.rejected, setFailed)

      .addCase(signupHost.pending, setLoading)
      .addCase(signupHost.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload?.token ?? null;
      })
      .addCase(signupHost.rejected, setFailed)

      .addCase(verifyEmail.pending, setLoading)
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload?.token ?? null;
      })
      .addCase(verifyEmail.rejected, setFailed)

      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.status = "idle";
        state.error = null;
      });
  }
});

export const { setToken, clearAuth } = authSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;

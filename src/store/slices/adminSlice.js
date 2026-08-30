import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Async thunks ─────────────────────────────────────────────────────────────

export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchAdminUsers",
  async ({ page = 1, limit = 20, role, search } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (role) params.set("role", role);
      if (search && search.trim()) params.set("search", search.trim());
      const { data } = await axiosInstance.get(`/admin/users?${params.toString()}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchAdminUser = createAsyncThunk(
  "admin/fetchAdminUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/admin/users/${userId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const updateAdminUser = createAsyncThunk(
  "admin/updateAdminUser",
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/admin/users/${userId}`, payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const deleteAdminUser = createAsyncThunk(
  "admin/deleteAdminUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/admin/users/${userId}`);
      return { userId, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    usersTabs: { all: 0, user: 0, host: 0, admin: 0 },
    usersPagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    usersStatus: "idle",
    usersError: null,

    selectedUser: null,
    selectedUserStatus: "idle",
    selectedUserError: null,

    userActionStatus: "idle",
    userActionError: null,
  },
  reducers: {
    clearSelectedAdminUser(state) {
      state.selectedUser = null;
      state.selectedUserStatus = "idle";
      state.selectedUserError = null;
    },
    clearAdminUserActionError(state) {
      state.userActionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminUsers
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersStatus = "loading";
        state.usersError = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersStatus = "succeeded";
        const d = action.payload?.data ?? action.payload ?? {};
        state.users = Array.isArray(d.users) ? d.users : [];
        state.usersTabs = d.tabs ?? state.usersTabs;
        state.usersPagination = d.pagination ?? state.usersPagination;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersStatus = "failed";
        state.usersError = action.payload;
      })

      // fetchAdminUser
      .addCase(fetchAdminUser.pending, (state) => {
        state.selectedUserStatus = "loading";
        state.selectedUserError = null;
      })
      .addCase(fetchAdminUser.fulfilled, (state, action) => {
        state.selectedUserStatus = "succeeded";
        state.selectedUser = action.payload?.data ?? action.payload;
      })
      .addCase(fetchAdminUser.rejected, (state, action) => {
        state.selectedUserStatus = "failed";
        state.selectedUserError = action.payload;
      })

      // updateAdminUser
      .addCase(updateAdminUser.pending, (state) => {
        state.userActionStatus = "loading";
        state.userActionError = null;
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        state.userActionStatus = "succeeded";
        const updated = action.payload?.data ?? action.payload;
        if (state.selectedUser?.id === updated?.id) state.selectedUser = updated;
        const idx = state.users.findIndex((u) => u.id === updated?.id);
        if (idx !== -1) state.users[idx] = { ...state.users[idx], ...updated };
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.userActionStatus = "failed";
        state.userActionError = action.payload;
      })

      // deleteAdminUser
      .addCase(deleteAdminUser.pending, (state) => {
        state.userActionStatus = "loading";
        state.userActionError = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.userActionStatus = "succeeded";
        state.users = state.users.filter((u) => u.id !== action.payload.userId);
        if (state.selectedUser?.id === action.payload.userId) state.selectedUser = null;
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.userActionStatus = "failed";
        state.userActionError = action.payload;
      });
  },
});

export const { clearSelectedAdminUser, clearAdminUserActionError } = adminSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectAdminUsers = (state) => state.admin.users;
export const selectAdminUsersTabs = (state) => state.admin.usersTabs;
export const selectAdminUsersPagination = (state) => state.admin.usersPagination;
export const selectAdminUsersStatus = (state) => state.admin.usersStatus;
export const selectAdminUsersError = (state) => state.admin.usersError;

export const selectSelectedAdminUser = (state) => state.admin.selectedUser;
export const selectSelectedAdminUserStatus = (state) => state.admin.selectedUserStatus;
export const selectSelectedAdminUserError = (state) => state.admin.selectedUserError;

export const selectAdminUserActionStatus = (state) => state.admin.userActionStatus;
export const selectAdminUserActionError = (state) => state.admin.userActionError;

export default adminSlice.reducer;

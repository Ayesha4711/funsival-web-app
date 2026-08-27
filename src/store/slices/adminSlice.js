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
  },
  reducers: {
    clearSelectedAdminUser(state) {
      state.selectedUser = null;
      state.selectedUserStatus = "idle";
      state.selectedUserError = null;
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
      });
  },
});

export const { clearSelectedAdminUser } = adminSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectAdminUsers = (state) => state.admin.users;
export const selectAdminUsersTabs = (state) => state.admin.usersTabs;
export const selectAdminUsersPagination = (state) => state.admin.usersPagination;
export const selectAdminUsersStatus = (state) => state.admin.usersStatus;
export const selectAdminUsersError = (state) => state.admin.usersError;

export const selectSelectedAdminUser = (state) => state.admin.selectedUser;
export const selectSelectedAdminUserStatus = (state) => state.admin.selectedUserStatus;
export const selectSelectedAdminUserError = (state) => state.admin.selectedUserError;

export default adminSlice.reducer;

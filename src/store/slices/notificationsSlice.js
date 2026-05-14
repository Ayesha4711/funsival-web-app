import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = 20, unreadOnly = false } = {}, { rejectWithValue }) => {
    try {
      let url = `/notifications?page=${page}&limit=${limit}`;
      if (unreadOnly) url += "&unreadOnly=true";
      const { data } = await axiosInstance.get(url);
      return { ...data, _requestedPage: page };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/notifications/unread-count");
      return data?.data?.count ?? data?.count ?? 0;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.patch("/notifications/read-all");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    pagination: { page: 1, limit: 20, total: 0, hasNextPage: false },
    // Server-authoritative unread badge count (from /notifications/unread-count)
    unreadCountFromServer: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    // Prepend a single notification received via FCM foreground message
    prependNotification(state, action) {
      const n = action.payload;
      const id = n.id ?? n._id;
      // Avoid duplicates
      if (!id || !state.items.find((x) => (x.id ?? x._id) === id)) {
        state.items.unshift(n);
        state.unreadCountFromServer = Math.max(0, state.unreadCountFromServer + 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        // API shape: { data: { notifications: [], pagination: {} } }
        const incoming = action.payload?.data?.notifications ?? action.payload?.data ?? [];
        const pagination = action.payload?.data?.pagination ?? action.payload?.pagination ?? state.pagination;
        const requestedPage = action.payload?._requestedPage ?? 1;

        if (requestedPage === 1) {
          state.items = incoming;
        } else {
          const existingIds = new Set(state.items.map((n) => n.id ?? n._id));
          state.items = [...state.items, ...incoming.filter((n) => !existingIds.has(n.id ?? n._id))];
        }
        state.pagination = { ...pagination, page: requestedPage };
        // Sync local unread count from the loaded items
        state.unreadCountFromServer = state.items.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCountFromServer = action.payload;
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true, isRead: true }));
        state.unreadCountFromServer = 0;
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.items.find((n) => (n.id ?? n._id) === id);
        if (item && !item.read) {
          item.read = true;
          item.isRead = true;
          state.unreadCountFromServer = Math.max(0, state.unreadCountFromServer - 1);
        }
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const idx = state.items.findIndex((n) => (n.id ?? n._id) === id);
        if (idx !== -1) {
          if (!state.items[idx].read) {
            state.unreadCountFromServer = Math.max(0, state.unreadCountFromServer - 1);
          }
          state.items.splice(idx, 1);
        }
      });
  },
});

export const { prependNotification } = notificationsSlice.actions;

export const selectNotifications       = (state) => state.notifications.items;
export const selectNotificationsStatus = (state) => state.notifications.status;
export const selectHasNextPage         = (state) => state.notifications.pagination?.hasNextPage ?? false;
export const selectCurrentPage         = (state) => state.notifications.pagination?.page ?? 1;
// Use server count as the authoritative badge; fall back to local count
export const selectUnreadCount         = (state) =>
  state.notifications.unreadCountFromServer > 0
    ? state.notifications.unreadCountFromServer
    : state.notifications.items.filter((n) => !n.read && !n.isRead).length;

export default notificationsSlice.reducer;

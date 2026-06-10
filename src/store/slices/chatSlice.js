import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

export const startOrGetConversation = createAsyncThunk(
  "chat/startOrGetConversation",
  async ({ recipientId, listingId, initialMessage }, { rejectWithValue }) => {
    try {
      const body = { recipientId };
      if (listingId) body.listingId = listingId;
      if (initialMessage) body.initialMessage = initialMessage;
      const { data } = await axiosInstance.post("/chats/conversations", body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const markConversationRead = createAsyncThunk(
  "chat/markConversationRead",
  async (conv, { rejectWithValue }) => {
    try {
      const BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://funsival-backend-twvuq.ondigitalocean.app/api/v1";
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("auth-token");
        if (!token) {
          const match = document.cookie.match(/(^|;)\s*auth-token\s*=\s*([^;]+)/);
          token = match ? match[2] : null;
        }
      }
      const res = await fetch(`${BASE_URL}/chats/conversations/${conv.id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok && res.status !== 404) {
        const body = await res.json().catch(() => ({}));
        return rejectWithValue(body?.message ?? `HTTP ${res.status}`);
      }
      return conv.id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markMessageRead = createAsyncThunk(
  "chat/markMessageRead",
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    try {
      // Extract MongoDB ObjectId from compound conversation id (same logic as markConversationRead)
      let routeId = conversationId;
      if (!/^[a-f0-9]{24}$/i.test(conversationId)) {
        const parts = (conversationId ?? "").split(/[_]+/);
        const objectId = parts.find((p) => /^[a-f0-9]{24}$/i.test(p));
        if (objectId) routeId = objectId;
      }
      const { data } = await axiosInstance.patch(
        `/chats/conversations/${routeId}/messages/${messageId}/read`
      );
      return { conversationId, message: data?.data?.message ?? { id: messageId } };
    } catch (err) {
      if (err.response?.status === 404) return { conversationId, message: { id: messageId } };
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/chats/conversations?page=${page}&limit=${limit}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ conversationId, limit = 30, cursor }, { rejectWithValue }) => {
    try {
      let url = `/chats/conversations/${conversationId}/messages?limit=${limit}`;
      if (cursor) url += `&cursor=${cursor}`;
      const { data } = await axiosInstance.get(url);
      return { ...data, conversationId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, text }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `/chats/conversations/${conversationId}/messages`,
        { text, type: "text" }
      );
      return { ...data, conversationId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const uploadChatMedia = createAsyncThunk(
  "chat/uploadChatMedia",
  async ({ file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axiosInstance.post("/chats/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const sendMediaMessage = createAsyncThunk(
  "chat/sendMediaMessage",
  async ({ conversationId, mediaUpload, thumbnailUrl, caption }, { rejectWithValue }) => {
    try {
      const body = {
        type: mediaUpload.mediaType,
        mediaUrl: mediaUpload.mediaUrl,
        mimeType: mediaUpload.mimeType,
        fileName: mediaUpload.fileName,
        fileSize: mediaUpload.fileSize,
      };
      if (thumbnailUrl) body.thumbnailUrl = thumbnailUrl;
      if (caption) body.text = caption;
      const { data } = await axiosInstance.post(
        `/chats/conversations/${conversationId}/messages`,
        body
      );
      return { ...data, conversationId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    conversationsPagination: { page: 1, limit: 20, total: 0, hasNextPage: false },
    conversationsStatus: "idle",
    activeConversationId: null,
    messagesByConversation: {},
    messagesStatus: "idle",
    sendStatus: "idle",
    error: null,
    // Track conversations whose unread count was cleared locally but not yet confirmed by backend
    clearedUnreadIds: [],
  },
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    appendOptimisticMessage(state, action) {
      const { conversationId, message } = action.payload;
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }
      state.messagesByConversation[conversationId].push(message);
    },
    clearChatError(state) {
      state.error = null;
    },
    clearUnreadCount(state, action) {
      const conversationId = action.payload;
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv) conv.unreadCount = {};
      // Remember this was cleared so polling doesn't restore the old count
      if (!state.clearedUnreadIds.includes(conversationId)) {
        state.clearedUnreadIds.push(conversationId);
      }
    },
    // Merge incoming messages from polling/FCM without losing optimistic messages
    receiveIncomingMessages(state, action) {
      const { conversationId, messages } = action.payload;
      if (!conversationId || !messages) return;
      const existing = state.messagesByConversation[conversationId] ?? [];
      const existingIds = new Set(existing.filter((m) => !m._optimistic).map((m) => m.id));
      const newMsgs = messages.filter((m) => !existingIds.has(m.id));
      if (newMsgs.length === 0) return;
      // Keep optimistic messages at the end, insert real ones before them
      const optimistic = existing.filter((m) => m._optimistic);
      const real = existing.filter((m) => !m._optimistic);
      state.messagesByConversation[conversationId] = [...real, ...newMsgs, ...optimistic];
      // Update conversation's last message if newer
      const last = newMsgs[newMsgs.length - 1];
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (conv && last) {
        conv.lastMessage = { text: last.text, senderId: last.senderId, type: last.type, createdAt: last.createdAt };
        conv.lastMessageAt = last.createdAt;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startOrGetConversation.fulfilled, (state, action) => {
        const conv = action.payload?.data?.conversation;
        if (!conv) return;
        const exists = state.conversations.find((c) => c.id === conv.id);
        if (!exists) state.conversations.unshift(conv);
        state.activeConversationId = conv.id;
      })
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsStatus = "succeeded";
        const incoming = action.payload?.data?.conversations ?? [];
        const cleared = new Set(state.clearedUnreadIds);
        state.conversations = incoming.map((conv) => {
          if (!cleared.has(conv.id)) return conv;
          // Server returned a non-zero count — a new message arrived after we read,
          // so remove from cleared set and show the real count
          const serverTotal = Object.values(conv.unreadCount ?? {}).reduce((s, n) => s + (n || 0), 0);
          if (serverTotal > 0) {
            state.clearedUnreadIds = state.clearedUnreadIds.filter((id) => id !== conv.id);
            return conv;
          }
          // Server still shows 0 (or hasn't caught up yet) — keep suppressed
          return { ...conv, unreadCount: {} };
        });
        state.conversationsPagination =
          action.payload?.data?.pagination ?? state.conversationsPagination;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messagesStatus = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesStatus = "succeeded";
        const convId = action.payload.conversationId;
        const incoming = action.payload?.data?.messages ?? [];
        const existing = state.messagesByConversation[convId] ?? [];

        // Build a set of real (non-optimistic) ids already in state
        const existingRealIds = new Set(existing.filter((m) => !m._optimistic).map((m) => m.id));

        // Only add messages not already present
        const newMsgs = incoming.filter((m) => !existingRealIds.has(m.id));

        if (newMsgs.length === 0 && existing.length > 0) return; // nothing changed

        // Replace real messages with the full server list, keep pending optimistic ones
        const optimistic = existing.filter((m) => m._optimistic);
        const incomingIds = new Set(incoming.map((m) => m.id));
        const uniqueOptimistic = optimistic.filter((m) => !incomingIds.has(m.id));
        state.messagesByConversation[convId] = [...incoming, ...uniqueOptimistic];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesStatus = "failed";
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = "loading";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendStatus = "idle";
        const convId = action.payload?.conversationId;
        const msg = action.payload?.data?.message ?? action.payload?.data;
        if (convId && msg) {
          if (!state.messagesByConversation[convId]) {
            state.messagesByConversation[convId] = [];
          }
          // Remove all optimistic messages and any existing real message with same id
          const withoutOptimistic = state.messagesByConversation[convId].filter(
            (m) => !m._optimistic && m.id !== msg.id
          );
          state.messagesByConversation[convId] = [...withoutOptimistic, msg];
        }
        // Update last message in conversation list
        const conv = state.conversations.find((c) => c.id === convId);
        if (conv && msg) {
          conv.lastMessage = {
            text: msg.text,
            senderId: msg.senderId,
            type: msg.type,
            createdAt: msg.createdAt,
          };
          conv.lastMessageAt = msg.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendStatus = "idle";
        state.error = action.payload;
        // Remove optimistic messages on failure
        Object.keys(state.messagesByConversation).forEach((id) => {
          state.messagesByConversation[id] = state.messagesByConversation[id].filter(
            (m) => !m._optimistic
          );
        });
      })
      .addCase(sendMediaMessage.pending, (state) => {
        state.sendStatus = "loading";
      })
      .addCase(sendMediaMessage.fulfilled, (state, action) => {
        state.sendStatus = "idle";
        const convId = action.payload?.conversationId;
        const msg = action.payload?.data?.message ?? action.payload?.data;
        if (convId && msg) {
          if (!state.messagesByConversation[convId]) {
            state.messagesByConversation[convId] = [];
          }
          const withoutOptimistic = state.messagesByConversation[convId].filter(
            (m) => !m._optimistic && m.id !== msg.id
          );
          state.messagesByConversation[convId] = [...withoutOptimistic, msg];
        }
        const conv = state.conversations.find((c) => c.id === convId);
        if (conv && msg) {
          conv.lastMessage = { text: msg.text, senderId: msg.senderId, type: msg.type, createdAt: msg.createdAt };
          conv.lastMessageAt = msg.createdAt;
        }
      })
      .addCase(sendMediaMessage.rejected, (state, action) => {
        state.sendStatus = "idle";
        state.error = action.payload;
        Object.keys(state.messagesByConversation).forEach((id) => {
          state.messagesByConversation[id] = state.messagesByConversation[id].filter(
            (m) => !m._optimistic
          );
        });
      })
      .addCase(markConversationRead.fulfilled, (state, action) => {
        const convId = action.payload;
        const conv = state.conversations.find((c) => c.id === convId);
        if (conv) conv.unreadCount = {};
        // Keep it in clearedUnreadIds so future polls don't restore stale counts
        if (!state.clearedUnreadIds.includes(convId)) {
          state.clearedUnreadIds.push(convId);
        }
      })
      .addCase(markMessageRead.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        const msgs = state.messagesByConversation[conversationId];
        if (!msgs) return;
        const idx = msgs.findIndex((m) => m.id === message.id);
        if (idx !== -1 && message.readBy) {
          msgs[idx] = { ...msgs[idx], readBy: message.readBy };
        }
      });
  },
});

export const { setActiveConversation, appendOptimisticMessage, clearChatError, receiveIncomingMessages, clearUnreadCount } =
  chatSlice.actions;

export const selectConversations = (state) => state.chat.conversations;
export const selectConversationsStatus = (state) => state.chat.conversationsStatus;
export const selectActiveConversationId = (state) => state.chat.activeConversationId;
export const selectMessagesStatus = (state) => state.chat.messagesStatus;
export const selectSendStatus = (state) => state.chat.sendStatus;

const EMPTY_MESSAGES = [];
export const selectMessagesByConversation = (id) =>
  createSelector(
    (state) => state.chat.messagesByConversation[id],
    (msgs) => msgs ?? EMPTY_MESSAGES
  );

// Pass currentUserId as the second argument to count only THIS user's unread messages
export const selectTotalUnreadCount = createSelector(
  (state) => state.chat.conversations,
  (_state, currentUserId) => currentUserId,
  (conversations, currentUserId) =>
    conversations.reduce((sum, conv) => {
      const counts = conv.unreadCount ?? {};
      if (currentUserId) return sum + (counts[currentUserId] || 0);
      // Fallback: sum all keys (old behaviour) if no user id provided
      return sum + Object.values(counts).reduce((s, n) => s + (n || 0), 0);
    }, 0)
);

export default chatSlice.reducer;

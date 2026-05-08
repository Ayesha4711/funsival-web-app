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
      // The API needs the MongoDB _id, not the compound participant string id.
      // Try _id first, then strip the compound id to extract a 24-char hex ObjectId,
      // then fall back to the raw id field.
      let routeId = conv._id ?? conv.mongoId ?? null;
      if (!routeId) {
        // compound id looks like "aaa_bbb__ccc" — pick the last 24-char hex segment
        const parts = (conv.id ?? "").split(/[_]+/);
        const objectId = parts.find((p) => /^[a-f0-9]{24}$/i.test(p));
        routeId = objectId ?? conv.id;
      }
      await axiosInstance.put(`/chats/conversations/${routeId}/read`);
      return conv.id;
    } catch (err) {
      // Silently swallow 404s — message was already read or conversation id format mismatch
      if (err.response?.status === 404) return conv.id;
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
        state.conversations = action.payload?.data?.conversations ?? [];
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
      .addCase(markConversationRead.fulfilled, (state, action) => {
        const conv = state.conversations.find((c) => c.id === action.payload);
        if (conv) conv.unreadCount = {};
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

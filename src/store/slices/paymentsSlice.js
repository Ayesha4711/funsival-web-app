import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axiosInstance";

// ─── Cards (SetupIntent flow) ─────────────────────────────────────────────────

export const createSetupIntent = createAsyncThunk(
  "payments/createSetupIntent",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/payments/cards/setup-intent");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);


export const fetchSavedCards = createAsyncThunk(
  "payments/fetchSavedCards",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/payments/cards");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const setDefaultCard = createAsyncThunk(
  "payments/setDefaultCard",
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/payments/cards/${paymentMethodId}/default`);
      return { paymentMethodId, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const deleteCard = createAsyncThunk(
  "payments/deleteCard",
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/payments/cards/${paymentMethodId}`);
      return paymentMethodId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Stripe Connect ───────────────────────────────────────────────────────────

export const startConnectOnboarding = createAsyncThunk(
  "payments/startConnectOnboarding",
  async ({ country } = {}, { rejectWithValue }) => {
    try {
      const body = country ? { country } : {};
      const { data } = await axiosInstance.post("/payments/connect/onboard", body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchConnectStatus = createAsyncThunk(
  "payments/fetchConnectStatus",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/payments/connect/status");
      return data;
    } catch (err) {
      const status = err.response?.status;
      // 404 = endpoint not deployed yet → treat same as "no account" so gate shows
      if (status === 404) {
        return { data: { chargesEnabled: false, hasAccount: false, _endpointMissing: true } };
      }
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchConnectLoginLink = createAsyncThunk(
  "payments/fetchConnectLoginLink",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/payments/login-link");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Admin: direct refund (bypass request flow) ───────────────────────────────

export const adminDirectRefund = createAsyncThunk(
  "payments/adminDirectRefund",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      const body = reason ? { reason } : {};
      const { data } = await axiosInstance.post(`/payments/bookings/${bookingId}/refund`, body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Admin: refund requests ───────────────────────────────────────────────────

export const fetchAdminRefundRequests = createAsyncThunk(
  "payments/fetchAdminRefundRequests",
  async ({ status, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.set("status", status);
      const { data } = await axiosInstance.get(`/admin/refund-requests?${params.toString()}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const fetchAdminRefundRequest = createAsyncThunk(
  "payments/fetchAdminRefundRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/admin/refund-requests/${requestId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const approveRefundRequest = createAsyncThunk(
  "payments/approveRefundRequest",
  async ({ requestId, note }, { rejectWithValue }) => {
    try {
      const body = note ? { note } : {};
      const { data } = await axiosInstance.post(`/admin/refund-requests/${requestId}/approve`, body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

export const rejectRefundRequest = createAsyncThunk(
  "payments/rejectRefundRequest",
  async ({ requestId, note }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/admin/refund-requests/${requestId}/reject`, { note });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const paymentsSlice = createSlice({
  name: "payments",
  initialState: {
    // Saved cards
    cards: [],
    cardsLoading: false,
    cardsError: null,
    setupIntentSecret: null,
    setupIntentLoading: false,
    cardActionLoading: false,   // set-default / delete

    // Stripe Connect
    connectStatus: null,       // { hasAccount, accountId, chargesEnabled, payoutsEnabled, detailsSubmitted, disabledReason, requirements }
    connectStatusLoading: false,
    connectStatusError: null,

    onboardUrl: null,          // { url, expiresAt, accountId }
    onboardLoading: false,
    onboardError: null,

    loginLinkLoading: false,
    loginLinkError: null,

    // Admin refund requests
    refundRequests: [],
    refundRequestsPagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    refundRequestsStatus: "idle",
    refundRequestsError: null,

    selectedRefundRequest: null,
    selectedRefundRequestStatus: "idle",

    actionStatus: "idle",      // approve / reject / direct-refund
    actionError: null,
  },
  reducers: {
    clearConnectError(state) {
      state.connectStatusError = null;
      state.onboardError = null;
    },
    clearActionError(state) {
      state.actionError = null;
    },
    clearSelectedRefundRequest(state) {
      state.selectedRefundRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createSetupIntent
      .addCase(createSetupIntent.pending, (state) => {
        state.setupIntentLoading = true;
        state.setupIntentSecret = null;
      })
      .addCase(createSetupIntent.fulfilled, (state, action) => {
        state.setupIntentLoading = false;
        state.setupIntentSecret = action.payload?.data?.clientSecret ?? action.payload?.clientSecret ?? null;
      })
      .addCase(createSetupIntent.rejected, (state) => {
        state.setupIntentLoading = false;
      })

      // fetchSavedCards
      .addCase(fetchSavedCards.pending, (state) => {
        state.cardsLoading = true;
        state.cardsError = null;
      })
      .addCase(fetchSavedCards.fulfilled, (state, action) => {
        state.cardsLoading = false;
        const raw = action.payload?.data?.paymentMethods ?? action.payload?.data?.cards ?? action.payload?.data ?? [];
        state.cards = Array.isArray(raw) ? raw : [];
      })
      .addCase(fetchSavedCards.rejected, (state, action) => {
        state.cardsLoading = false;
        state.cardsError = action.payload;
      })

      // setDefaultCard
      .addCase(setDefaultCard.pending, (state) => { state.cardActionLoading = true; })
      .addCase(setDefaultCard.fulfilled, (state, action) => {
        state.cardActionLoading = false;
        const pmId = action.payload?.paymentMethodId;
        state.cards = state.cards.map((c) => ({ ...c, isDefault: c.id === pmId }));
      })
      .addCase(setDefaultCard.rejected, (state) => { state.cardActionLoading = false; })

      // deleteCard
      .addCase(deleteCard.pending, (state) => { state.cardActionLoading = true; })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.cardActionLoading = false;
        state.cards = state.cards.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCard.rejected, (state) => { state.cardActionLoading = false; })

      // fetchConnectStatus
      .addCase(fetchConnectStatus.pending, (state) => {
        state.connectStatusLoading = true;
        state.connectStatusError = null;
      })
      .addCase(fetchConnectStatus.fulfilled, (state, action) => {
        state.connectStatusLoading = false;
        state.connectStatus = action.payload?.data ?? action.payload;
      })
      .addCase(fetchConnectStatus.rejected, (state, action) => {
        state.connectStatusLoading = false;
        state.connectStatusError = action.payload;
      })

      // startConnectOnboarding
      .addCase(startConnectOnboarding.pending, (state) => {
        state.onboardLoading = true;
        state.onboardError = null;
      })
      .addCase(startConnectOnboarding.fulfilled, (state, action) => {
        state.onboardLoading = false;
        state.onboardUrl = action.payload?.data ?? action.payload;
      })
      .addCase(startConnectOnboarding.rejected, (state, action) => {
        state.onboardLoading = false;
        state.onboardError = action.payload;
      })

      // fetchConnectLoginLink — just track loading; caller handles redirect
      .addCase(fetchConnectLoginLink.pending, (state) => {
        state.loginLinkLoading = true;
        state.loginLinkError = null;
      })
      .addCase(fetchConnectLoginLink.fulfilled, (state) => {
        state.loginLinkLoading = false;
      })
      .addCase(fetchConnectLoginLink.rejected, (state, action) => {
        state.loginLinkLoading = false;
        state.loginLinkError = action.payload;
      })

      // fetchAdminRefundRequests
      .addCase(fetchAdminRefundRequests.pending, (state) => {
        state.refundRequestsStatus = "loading";
        state.refundRequestsError = null;
      })
      .addCase(fetchAdminRefundRequests.fulfilled, (state, action) => {
        state.refundRequestsStatus = "succeeded";
        const d = action.payload?.data;
        state.refundRequests = d?.refundRequests ?? d?.requests ?? action.payload?.data ?? [];
        state.refundRequestsPagination = d?.pagination ?? state.refundRequestsPagination;
      })
      .addCase(fetchAdminRefundRequests.rejected, (state, action) => {
        state.refundRequestsStatus = "failed";
        state.refundRequestsError = action.payload;
      })

      // fetchAdminRefundRequest
      .addCase(fetchAdminRefundRequest.pending, (state) => {
        state.selectedRefundRequestStatus = "loading";
      })
      .addCase(fetchAdminRefundRequest.fulfilled, (state, action) => {
        state.selectedRefundRequestStatus = "succeeded";
        state.selectedRefundRequest = action.payload?.data ?? action.payload;
      })
      .addCase(fetchAdminRefundRequest.rejected, (state, action) => {
        state.selectedRefundRequestStatus = "failed";
        state.actionError = action.payload;
      })

      // approveRefundRequest / rejectRefundRequest / adminDirectRefund
      .addCase(approveRefundRequest.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(approveRefundRequest.fulfilled, (state, action) => {
        state.actionStatus = "idle";
        const updated = action.payload?.data?.refundRequest ?? null;
        if (updated) {
          const idx = state.refundRequests.findIndex((r) => r.id === updated.id);
          if (idx !== -1) state.refundRequests[idx] = updated;
          if (state.selectedRefundRequest?.id === updated.id) {
            state.selectedRefundRequest = updated;
          }
        }
      })
      .addCase(approveRefundRequest.rejected, (state, action) => {
        state.actionStatus = "idle";
        state.actionError = action.payload;
      })

      .addCase(rejectRefundRequest.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(rejectRefundRequest.fulfilled, (state, action) => {
        state.actionStatus = "idle";
        const updated = action.payload?.data?.refundRequest ?? null;
        if (updated) {
          const idx = state.refundRequests.findIndex((r) => r.id === updated.id);
          if (idx !== -1) state.refundRequests[idx] = updated;
          if (state.selectedRefundRequest?.id === updated.id) {
            state.selectedRefundRequest = updated;
          }
        }
      })
      .addCase(rejectRefundRequest.rejected, (state, action) => {
        state.actionStatus = "idle";
        state.actionError = action.payload;
      })

      .addCase(adminDirectRefund.pending, (state) => {
        state.actionStatus = "loading";
        state.actionError = null;
      })
      .addCase(adminDirectRefund.fulfilled, (state) => {
        state.actionStatus = "idle";
      })
      .addCase(adminDirectRefund.rejected, (state, action) => {
        state.actionStatus = "idle";
        state.actionError = action.payload;
      });
  },
});

export const { clearConnectError, clearActionError, clearSelectedRefundRequest } =
  paymentsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectSavedCards = (state) => {
  const cards = state.payments.cards;
  return Array.isArray(cards) ? cards : [];
};
export const selectCardsLoading = (state) => state.payments.cardsLoading;
export const selectCardsError = (state) => state.payments.cardsError;
export const selectSetupIntentSecret = (state) => state.payments.setupIntentSecret;
export const selectSetupIntentLoading = (state) => state.payments.setupIntentLoading;
export const selectCardActionLoading = (state) => state.payments.cardActionLoading;

export const selectConnectStatus = (state) => state.payments.connectStatus;
export const selectConnectStatusLoading = (state) => state.payments.connectStatusLoading;
export const selectConnectStatusError = (state) => state.payments.connectStatusError;
export const selectOnboardLoading = (state) => state.payments.onboardLoading;
export const selectOnboardError = (state) => state.payments.onboardError;
export const selectLoginLinkLoading = (state) => state.payments.loginLinkLoading;

export const selectAdminRefundRequests = (state) => state.payments.refundRequests;
export const selectAdminRefundRequestsPagination = (state) => state.payments.refundRequestsPagination;
export const selectAdminRefundRequestsStatus = (state) => state.payments.refundRequestsStatus;
export const selectSelectedRefundRequest = (state) => state.payments.selectedRefundRequest;
export const selectPaymentsActionStatus = (state) => state.payments.actionStatus;
export const selectPaymentsActionError = (state) => state.payments.actionError;

export default paymentsSlice.reducer;

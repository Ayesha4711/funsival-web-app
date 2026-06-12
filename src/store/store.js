import { configureStore, createAction } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import listingsReducer from "./slices/listingsSlice";
import activitiesReducer from "./slices/activitiesSlice";
import bookingsReducer from "./slices/bookingsSlice";
import chatReducer from "./slices/chatSlice";
import notificationsReducer from "./slices/notificationsSlice";
import paymentsReducer from "./slices/paymentsSlice";
import reviewsReducer from "./slices/reviewsSlice";

export const resetStore = createAction("store/reset");

// Wraps every slice reducer so that dispatching resetStore returns it to its initial state
function withReset(reducer) {
  return (state, action) => {
    if (action.type === resetStore.type) return reducer(undefined, action);
    return reducer(state, action);
  };
}

export const store = configureStore({
  reducer: {
    auth:          withReset(authReducer),
    profile:       withReset(profileReducer),
    listings:      withReset(listingsReducer),
    activities:    withReset(activitiesReducer),
    bookings:      withReset(bookingsReducer),
    chat:          withReset(chatReducer),
    notifications: withReset(notificationsReducer),
    payments:      withReset(paymentsReducer),
    reviews:       withReset(reviewsReducer),
  },
});

export default store;

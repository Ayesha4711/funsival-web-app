import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import listingsReducer from "./slices/listingsSlice";
import activitiesReducer from "./slices/activitiesSlice";
import bookingsReducer from "./slices/bookingsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    listings: listingsReducer,
    activities: activitiesReducer,
    bookings: bookingsReducer,
  },
});

export default store;

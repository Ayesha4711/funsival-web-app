"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "@/lib/api";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(({ ok, data }) => {
      if (ok) setProfile(data?.data?.user ?? null);
      setLoading(false);
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

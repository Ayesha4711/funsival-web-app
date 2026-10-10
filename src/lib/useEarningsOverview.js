"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/store/axiosInstance";

/**
 * Shared fetch for GET /payments/connect/earnings/overview — calendar-year
 * Jan–Dec trend + category breakdown. Used by the earnings charts and
 * platform fee card to read account-specific payment totals.
 */
export default function useEarningsOverview(currency) {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
      try {
        const params = {};
        if (currency) params.currency = currency;
        const { data } = await axiosInstance.get("/payments/connect/earnings/overview", {
          params,
          signal: controller.signal,
        });
        if (!active) return;
        setState({ loading: false, error: "", data: data?.data ?? data ?? null });
      } catch (error) {
        if (!active || error?.code === "ERR_CANCELED") return;
        setState({
          loading: false,
          error: error?.response?.data?.message || error?.message || "Unable to load earnings overview.",
          data: null,
        });
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [currency]);

  return state;
}


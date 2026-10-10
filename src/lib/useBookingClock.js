'use client';

import { useEffect, useMemo, useState } from 'react';
import { bookingClock } from './bookingClock';

export default function useBookingClock(timeZone = 'UTC') {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return useMemo(() => bookingClock(timeZone, now), [timeZone, now]);
}

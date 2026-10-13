'use client';

import { useSyncExternalStore } from 'react';

const subscribe = onChange => {
  window.addEventListener('focus', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.removeEventListener('focus', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
};
const localZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const serverZone = () => null;

export default function useViewerTimeZone() {
  return useSyncExternalStore(subscribe, localZone, serverZone);
}

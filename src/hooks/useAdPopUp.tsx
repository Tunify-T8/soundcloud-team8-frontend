import { useEffect, useRef, useState } from "react";
import { useSubscription } from "./useSubscription"; 

const SESSION_KEY = "ad_shown_this_session";
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes yayyyyy

export function useAdPopup(loginOnlyMode = false) {
  const { isFree } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dismiss = () => setIsOpen(false);

  useEffect(() => {
    if (!isFree) {
      setIsOpen(false);
      return;
    }

    // Show once per session on first load
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setIsOpen(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    }

    if (loginOnlyMode) return;

    // Re-open every 20 minutes
    intervalRef.current = setInterval(() => setIsOpen(true), INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFree, loginOnlyMode]);

  return { isOpen, dismiss };
}
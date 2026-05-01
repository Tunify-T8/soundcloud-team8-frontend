import { useRef, useState, useCallback } from 'react';

export function useCaptcha(minTimeMs = 1500) {
  const [honeypot, setHoneypot] = useState('');
  const loadTime = useRef(Date.now());

  const isHuman = useCallback((): boolean => {
    const elapsed = Date.now() - loadTime.current;
    return honeypot === '' && elapsed >= minTimeMs;
  }, [honeypot, minTimeMs]);

  const reset = useCallback(() => {
    loadTime.current = Date.now();
    setHoneypot('');
  }, []);

  return { honeypot, setHoneypot, isHuman, reset };
}

import { useRef, useState, useCallback } from 'react';

const DEFAULT_MIN_TIME = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 1500;

export function useCaptcha(minTimeMs = DEFAULT_MIN_TIME) {
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

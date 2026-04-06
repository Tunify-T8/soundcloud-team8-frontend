import { useEffect, useState } from 'react';

/**
 * Delays updating a value until the user has stopped changing it.
 * Used in SearchBar to avoid firing an API call on every keystroke.
 *
 * @param value  The value to debounce (e.g. the search query string)
 * @param delay  How many milliseconds to wait (we use 300ms in SearchBar)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer — if value changes again before delay runs out, restart
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel the previous timer when value changes
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
import { useState, useEffect, useRef } from 'react';

export function useSearch(delay = 300) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (query.length >= 2 || query.length === 0) {
        setDebounced(query);
      }
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, delay]);

  const clear = () => { setQuery(''); setDebounced(''); };

  return { query, setQuery, debounced, clear };
}

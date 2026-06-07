import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePaginationOptions<T> {
  fetchFn: (page: number) => Promise<{ data: T[]; meta?: { current_page: number; last_page: number } }>;
  perPage?: number;
}

export function usePagination<T>({ fetchFn, perPage = 10 }: UsePaginationOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(1);
      if (!mountedRef.current) return;
      setData(res.data);
      setPage(1);
      if (res.meta) {
        setHasMore(res.meta.current_page < res.meta.last_page);
      } else {
        setHasMore(res.data.length >= perPage);
      }
    } catch {
      if (mountedRef.current) setError('Gagal memuat data');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [fetchFn, perPage]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetchFn(nextPage);
      if (!mountedRef.current) return;
      setData(prev => [...prev, ...res.data]);
      setPage(nextPage);
      if (res.meta) {
        setHasMore(res.meta.current_page < res.meta.last_page);
      } else {
        setHasMore(res.data.length >= perPage);
      }
    } catch {
      if (mountedRef.current) setError('Gagal memuat data');
    } finally {
      if (mountedRef.current) setLoadingMore(false);
    }
  }, [page, fetchFn, perPage]);

  return { data, setData, loading, loadingMore, error, hasMore, refresh, loadMore };
}

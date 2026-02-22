import { useState, useEffect, useCallback } from 'react';
import { TeachingStuff } from '@/types';

const API = `${import.meta.env.VITE_API_BASE_URL}/TeachingStaff`;

export default function useTeachingStuffs() {
  const [items, setItems] = useState<TeachingStuff[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API, { headers: { Accept: 'application/json' }, redirect: 'follow', mode: 'cors' });
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { teachingStuffs: items, loading, error, refetch: fetchAll } as const;
}

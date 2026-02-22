import { useCallback, useEffect, useState } from 'react';
import { Subject } from '../types';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/Subjects`;

export type UseSubjectsReturn = {
  subjects: Subject[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export default function useSubjects(): UseSubjectsReturn {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = API_URL;
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        redirect: 'follow',
        mode: 'cors'
      });
      if (res.status === 307) {
        const location = res.headers.get('location') || '(no location header)';
        throw new Error(`Server redirected (307) to ${location}`);
      }
      if (!res.ok) throw new Error(`Failed to fetch subjects: ${res.status}`);
      const json = (await res.json()) as Subject[];
      setSubjects(json);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    fetchData();
    return () => {
      mounted = false;
    };
  }, [fetchData]);

  return { subjects, loading, error, refetch: fetchData };
}

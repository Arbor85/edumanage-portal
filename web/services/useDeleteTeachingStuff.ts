import { useState, useCallback } from 'react';

const API = `${import.meta.env.VITE_API_SECURE_URL}/teachingstuff`;

export default function useDeleteTeachingStuff() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteItem = useCallback(async (id: string) => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: { Accept: 'application/json' }, redirect: 'follow', mode: 'cors' });
      if (!res.ok) throw new Error(`Delete failed ${res.status}`);
      return true;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteItem, deleting, error } as const;
}

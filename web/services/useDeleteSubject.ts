import { useState, useCallback } from 'react';

const API_BASE = `${import.meta.env.VITE_API_SECURE_URL}/Subjects`;

export default function useDeleteSubject() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteSubject = useCallback(async (id: string) => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        redirect: 'follow',
        mode: 'cors'
      });

      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }

      return true;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteSubject, deleting, error } as const;
}

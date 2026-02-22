import { useState, useEffect, useCallback } from 'react';

interface FilterState {
  term: string | null;
  field: string | null;
  purpose: string | null;
  search: string;
  page: number;
}

export default function useUrlFilters() {
  const [filters, setFilters] = useState<FilterState>({
    term: null,
    field: null,
    purpose: null,
    search: '',
    page: 1,
  });

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters({
      term: params.get('term') || null,
      field: params.get('field') || null,
      purpose: params.get('purpose') || null,
      search: params.get('search') || '',
      page: parseInt(params.get('page') || '1', 10),
    });
  }, []);

  // Sync to URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.term) params.set('term', filters.term);
    if (filters.field) params.set('field', filters.field);
    if (filters.purpose) params.set('purpose', filters.purpose);
    if (filters.search) params.set('search', filters.search);
    if (filters.page > 1) params.set('page', String(filters.page));

    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  const setTerm = useCallback((term: string | null) => {
    setFilters((prev) => ({ ...prev, term, page: 1 }));
  }, []);

  const setField = useCallback((field: string | null) => {
    setFilters((prev) => ({ ...prev, field, page: 1 }));
  }, []);

  const setPurpose = useCallback((purpose: string | null) => {
    setFilters((prev) => ({ ...prev, purpose, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  return {
    ...filters,
    setTerm,
    setField,
    setPurpose,
    setSearch,
    setPage,
  };
}

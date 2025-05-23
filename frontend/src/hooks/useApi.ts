import { useState, useCallback } from 'react';
import { handleApiError } from '../services/apiService';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useApi = <T = any>(options?: UseApiOptions) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiCall();
      setState(prev => ({ ...prev, data, loading: false }));
      options?.onSuccess?.(data);
      return data;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      options?.onError?.(errorMessage);
      throw err;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
};

// Hook spécialisé pour les opérations de mutation
export const useMutation = <T = any, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options?: UseApiOptions
) => {
  const [state, setState] = useState<UseApiState<T> & { isSuccess: boolean }>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
  });

  const mutate = useCallback(async (params: P) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, isSuccess: false }));
      const data = await mutationFn(params);
      setState(prev => ({ ...prev, data, loading: false, isSuccess: true }));
      options?.onSuccess?.(data);
      return data;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setState(prev => ({ ...prev, error: errorMessage, loading: false, isSuccess: false }));
      options?.onError?.(errorMessage);
      throw err;
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};

// Hook pour la pagination
export const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setTotal(0);
  }, [initialPage]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    previousPage,
    goToPage,
    reset,
  };
};
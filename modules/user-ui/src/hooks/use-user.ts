import { useState, useEffect } from 'react';
import { api } from '@/lib/api/api';

interface MutationOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  [key: string]: unknown;
}

export function useUserQuery(options?: Record<string, unknown>) {
  const [data, setData] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const res = await api.user.list();
      // Handle envelope
      const list = Array.isArray(res) ? res : res.data || [];
      setData(list);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, isLoading, error, refetch };
}

export function useCreateUser() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: Parameters<typeof api.user.create>[0], options?: MutationOptions) => {
    setIsPending(true);
    try {
      const res = await api.user.create(data);
      options?.onSuccess?.(res);
    } catch (e) {
      options?.onError?.(e);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

export function useUpdateUser(id?: string) {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: Parameters<typeof api.user.update>[1], options?: MutationOptions) => {
    if (!id) return;
    setIsPending(true);
    try {
      const res = await api.user.update(id, data);
      options?.onSuccess?.(res);
    } catch (e) {
      options?.onError?.(e);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

export function useDeleteUser() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (id: string, options?: MutationOptions) => {
    setIsPending(true);
    try {
      const res = await api.user.delete(id);
      options?.onSuccess?.(res);
    } catch (e) {
      options?.onError?.(e);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}

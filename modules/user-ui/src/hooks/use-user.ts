import { useState, useEffect } from 'react';
import { api } from '@/lib/api/api';
import type { Prisma } from '@prisma/client';

export function useUserQuery(options?: any) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const refetch = async () => {
        setIsLoading(true);
        try {
            const res = await api.user.list();
            // Handle envelope
            const list = Array.isArray(res) ? res : res.data || [];
            setData(list);
        } catch (e) {
            setError(e);
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

    const mutate = async (data: any, options?: any) => {
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

    const mutate = async (data: any, options?: any) => {
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

    const mutate = async (id: string, options?: any) => {
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

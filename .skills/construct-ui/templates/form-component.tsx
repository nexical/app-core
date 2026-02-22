'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { api, type ApiError } from '@/lib/api/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface NameFormProps {
  onSuccess?: () => void;
}

const createNameSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t('__module__.validation.email_invalid')),
    password: z.string().min(8, t('__module__.validation.password_min')),
  });

type NameFormValues = z.infer<ReturnType<typeof createNameSchema>>;

/**
 * Standard Form Component Template
 */
export function NameForm({ onSuccess }: NameFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const schema = createNameSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: NameFormValues) => {
    setServerError(null);
    startTransition(async () => {
      try {
        // Example API call - Replace with actual SDK method
        // const result = await api.__module__.__method__(data);

        // MOCK for template compilation - remove in actual code
        console.log('Mocking API call with data:', data);
        const result = { success: true, error: null };

        if (result.success) {
          toast.success(t('__module__.notifications.success'));
          onSuccess?.();
        } else {
          // Handle logical errors from the service (e.g., "User already exists")
          setServerError(t(result.error || '__module__.errors.generic_failure'));
        }
      } catch (error) {
        // Handle unexpected network or parsing errors
        const apiError = error as ApiError;
        setServerError(
          apiError.body?.error || apiError.message || t('__module__.errors.generic_failure'),
        );
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 p-4 surface-panel"
      data-testid="__name__-form"
    >
      {serverError && (
        <div
          className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg"
          data-testid="form-server-error"
        >
          {serverError}
        </div>
      )}

      <Input
        label={t('__module__.fields.email')}
        type="email"
        {...register('email')}
        error={errors.email?.message}
        data-testid="__name__-email-input"
      />

      <Input
        label={t('__module__.fields.password')}
        type="password"
        {...register('password')}
        error={errors.password?.message}
        data-testid="__name__-password-input"
      />

      <Button
        type="submit"
        loading={isPending}
        className="w-full"
        data-testid="__name__-submit-btn"
      >
        {t('__module__.actions.submit')}
      </Button>
    </form>
  );
}

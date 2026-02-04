import '@/lib/core/i18n-client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, type ApiError } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@modules/user-ui/src/components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import type { User } from '@prisma/client';

const passwordSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z.string().min(1, t('user.settings.password.validation.current_required')),
      newPassword: z.string().min(8, t('user.settings.password.validation.min_length')),
      confirmPassword: z.string().min(1, t('user.settings.password.validation.confirm_required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('user.settings.password.validation.mismatch'),
      path: ['confirmPassword'],
    });

type PasswordFormValues = z.infer<ReturnType<typeof passwordSchema>>;

interface PasswordFormProps {
  user: User;
}

export function PasswordForm({ user }: PasswordFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema(t)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setIsSubmitting(true);
    try {
      // Note: Currently updateMe doesn't support password verification.
      // We are just updating the password directly for now as per the DTO.
      // Ideally we should verify current password on server.
      await api.user.updateMe({
        id: user.id,
        password: values.newPassword,
      });
      form.reset();
      toast.success(t('user.settings.password.success_title'), {
        description: t('user.settings.password.success_message'),
      });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        (error as ApiError).body?.error ||
        (error as ApiError).message ||
        t('user.settings.password.error_message');
      toast.error(t('user.settings.password.error_title'), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('user.settings.password.title')}</CardTitle>
        <CardDescription>{t('user.settings.password.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">{t('user.settings.password.current_label')}</Label>
            <PasswordInput id="currentPassword" {...form.register('currentPassword')} />
            {form.formState.errors.currentPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">{t('user.settings.password.new_label')}</Label>
            <PasswordInput id="newPassword" {...form.register('newPassword')} />
            {form.formState.errors.newPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">{t('user.settings.password.confirm_label')}</Label>
            <PasswordInput id="confirmPassword" {...form.register('confirmPassword')} />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('user.auth.login.submitting_button')
              : t('user.settings.password.save_button')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, type ApiError } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '../ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const resetSchema = (t: (key: string) => string) =>
  z
    .object({
      newPassword: z.string().min(8, t('user.auth.reset_password.validation.password_min')),
      confirmPassword: z
        .string()
        .min(8, t('user.auth.reset_password.validation.confirm_password_required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('user.auth.reset_password.validation.passwords_mismatch'),
      path: ['confirmPassword'],
    });

type ResetFormValues = z.infer<ReturnType<typeof resetSchema>>;

export function ResetPasswordForm({ token, isValid }: { token: string; isValid: boolean }) {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const schema = resetSchema(t);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await api.user.auth.resetPassword({
        token,
        password: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (result.success) {
        // Retrieve "success" somehow or just redirect
        window.location.href = '/login?message=Password+reset+successful';
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as ApiError).body?.error ||
        (err as ApiError).message ||
        t('user.auth.reset_password.error.unexpected');
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValid) {
    return (
      <Card className="auth-card">
        <CardHeader>
          <CardTitle className="auth-card-title">
            {t('user.auth.reset_password.expired_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="auth-link-expired-content">
          <p className="auth-link-expired-text" data-testid="reset-password-expired-text">
            {t('user.auth.reset_password.expired_message')}
          </p>
          <a
            href="/forgot-password"
            className="auth-link-expired-action"
            data-testid="reset-password-new-link"
          >
            {t('user.auth.reset_password.request_new_link')}
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="auth-card">
      <CardHeader>
        <CardTitle className="auth-card-title">{t('user.auth.reset_password.title')}</CardTitle>
        <CardDescription className="auth-card-description">
          {t('user.auth.reset_password.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form-container" method="POST">
          {serverError && (
            <div
              className="auth-form-message auth-form-message-error"
              data-testid="reset-password-error"
            >
              {serverError}
            </div>
          )}

          <div className="auth-form-group">
            <Label htmlFor="newPassword">{t('user.auth.reset_password.new_password_label')}</Label>
            <PasswordInput
              id="newPassword"
              placeholder="********"
              className="auth-input"
              showStrengthMeter
              data-testid="reset-password-new-password"
              {...form.register('newPassword')}
            />
            {form.formState.errors.newPassword && (
              <p className="auth-form-input-error">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div className="auth-form-group">
            <Label htmlFor="confirmPassword">
              {t('user.auth.reset_password.confirm_password_label')}
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="********"
              className="auth-input"
              data-testid="reset-password-confirm-password"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword && (
              <p className="auth-form-input-error">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="auth-submit-button"
            disabled={!hydrated || isSubmitting}
            data-testid="reset-password-submit"
          >
            {isSubmitting
              ? t('user.auth.reset_password.submitting_button')
              : t('user.auth.reset_password.submit_button')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import '@/lib/core/i18n-client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, type ApiError } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/lib/core/config';

// Schema matching the server action input requirements
const registerSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(1, t('user.auth.register.validation.name_required')),
      username: z
        .string()
        .min(3, t('user.auth.register.validation.username_min'))
        .regex(/^[a-zA-Z0-9_]+$/, t('user.auth.register.validation.username_regex')),
      email: z.string().email(t('user.auth.register.validation.email_invalid')),
      password: z.string().min(8, t('user.auth.register.validation.password_min')),
      confirmPassword: z
        .string()
        .min(8, t('user.auth.register.validation.confirm_password_required')),
      token: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('user.auth.register.validation.passwords_mismatch'),
      path: ['confirmPassword'],
    });

type RegisterFormValues = z.infer<ReturnType<typeof registerSchema>>;

export function RegisterForm() {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [registeredTeamId, setRegisteredTeamId] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const [inviteValues, setInviteValues] = useState<{ email: string; token: string } | null>(null);

  const schema = registerSchema(t);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      token: '',
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const token = params.get('token');

    if (token) {
      // Invite flow
      form.setValue('token', token);
      if (email) {
        form.setValue('email', email);
      }
      setInviteValues({ email: email || '', token });
    }
  }, [form]);

  const onSubmit = async (values: RegisterFormValues) => {
    // Ensure token is passed from URL if not in form values
    if (!values.token) {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        values.token = urlToken;
      }
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await api.user.auth.register(values);

      if (result.success) {
        setSuccess(true);
        const data = result as { teamId?: string };
        if (data.teamId) {
          setRegisteredTeamId(data.teamId);
        }
      } else {
        setServerError(result.error || t('user.auth.register.error.generic'));
      }
    } catch (err: unknown) {
      // Try to extract specific error from API response
      const apiError =
        (err as ApiError).body?.error ||
        (err as ApiError).body?.message ||
        (err as ApiError).message;
      if (
        apiError &&
        (apiError.includes('invited users only') || apiError.includes('registration_restricted'))
      ) {
        setServerError(t('user.auth.register.error.restricted'));
      } else {
        setServerError(apiError || t('user.auth.register.error.generic'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="auth-success-card">
        <CardHeader>
          <CardTitle className="auth-card-title">{t('user.auth.register.success_title')}</CardTitle>
          <CardDescription className="auth-card-description">
            {t('user.auth.register.success_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="auth-form-container">
          <p className="auth-success-text" data-testid="register-success">
            {t('user.auth.register.success_message')}
          </p>
          <div className="auth-success-message-container">
            <a
              href={`/login?callbackUrl=${registeredTeamId ? `/teams/${registeredTeamId}` : inviteValues?.token ? `/invite/${inviteValues.token}` : '/'}`}
            >
              <Button
                variant="outline"
                className="auth-return-button"
                data-testid="proceed-to-login-btn"
              >
                {t('user.auth.register.proceed_to_login')}
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="auth-card">
      <CardHeader>
        <CardTitle className="auth-card-title">{t('user.auth.register.title')}</CardTitle>
        <CardDescription className="auth-card-description">
          {t('user.auth.register.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form-container" method="POST">
          <input type="hidden" {...form.register('token')} />
          {serverError && (
            <div
              id="register-error"
              className="auth-form-message auth-form-message-error"
              data-testid="register-error"
            >
              {serverError}
            </div>
          )}
          <div className="auth-form-group">
            <Label htmlFor="name">{t('user.auth.register.name_label')}</Label>
            <Input
              id="name"
              placeholder={t('user.auth.register.name_placeholder')}
              className="auth-input"
              data-testid="register-name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="auth-form-input-error" data-testid="field-error-name">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="auth-form-group">
            <Label htmlFor="username">{t('user.auth.register.username_label')}</Label>
            <Input
              id="username"
              placeholder={t('user.auth.register.username_placeholder')}
              className="auth-input"
              data-testid="register-username"
              {...form.register('username')}
            />
            {form.formState.errors.username && (
              <p className="auth-form-input-error" data-testid="field-error-username">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="auth-form-group">
            <Label htmlFor="email">{t('user.auth.register.email_label')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('user.auth.register.email_placeholder', {
                domain: config.PUBLIC_PRIMARY_DOMAIN,
              })}
              className="auth-input"
              data-testid="register-email"
              {...form.register('email')}
              readOnly={!!inviteValues?.token}
            />
            {form.formState.errors.email && (
              <p className="auth-form-input-error" data-testid="field-error-email">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="auth-form-group">
            <Label htmlFor="password">{t('user.auth.register.password_label')}</Label>
            <PasswordInput
              id="password"
              placeholder="********"
              className="auth-input"
              showStrengthMeter
              data-testid="register-password"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="auth-form-input-error" data-testid="field-error-password">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="auth-form-group">
            <Label htmlFor="confirmPassword">
              {t('user.auth.register.confirm_password_label')}
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="********"
              className="auth-input"
              data-testid="register-confirm-password"
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword && (
              <p className="auth-form-input-error" data-testid="field-error-confirmPassword">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="auth-submit-button"
            data-testid="register-submit"
            disabled={!hydrated || isSubmitting}
          >
            {isSubmitting
              ? t('user.auth.register.submitting_button')
              : t('user.auth.register.submit_button')}
          </Button>

          <div className="auth-login-link-container">
            <span className="auth-login-text">{t('user.auth.register.signin_text')}</span>
            <a href="/login" className="auth-link" data-testid="register-login-link">
              {t('user.auth.register.signin_link')}
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { api, type ApiError } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Lock, Loader2 } from 'lucide-react';
import { useNavData } from '@/lib/ui/nav-context';
import { type User, type UpdateUserDTO } from '@modules/user-api/src/sdk';

/**
 * Registry component for the user profile settings form.
 * Renders in the details panel.
 */
export default function UserProfileForm(props: { [key: string]: unknown }) {
  const { t } = useTranslation();
  const { context } = useNavData();
  const user = context?.user as User;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user)
    return (
      <div className="profile-form-loading-container">
        <Loader2 className="profile-form-loader" />
      </div>
    );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError(t('user.registry.profile_form.error.passwords_mismatch'));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const rawData = Object.fromEntries(formData);

    // Remove empty strings
    const data = Object.fromEntries(Object.entries(rawData).filter(([_, v]) => v !== ''));

    startTransition(async () => {
      try {
        const result = await api.user.updateMe({ ...data, id: user.id } as UpdateUserDTO);
        // Based on standard ServiceResponse pattern used in other components
        if (result.success) {
          setSuccess(t('user.registry.profile_form.success'));
          setPassword('');
          setConfirmPassword('');
        } else {
          setError(t(result.error || 'user.registry.profile_form.error.unknown'));
        }
      } catch (err: unknown) {
        const errorKey =
          (err as ApiError).body?.error ||
          (err as ApiError).message ||
          'user.registry.profile_form.error.unknown';
        setError(t(errorKey));
      }
    });
  }

  return (
    <div className="profile-form-header-container">
      <div>
        <h2 className="profile-form-title">{t('user.registry.profile_form.title')}</h2>
        <p className="profile-form-description">{t('user.registry.profile_form.description')}</p>
      </div>

      <form onSubmit={onSubmit} className="profile-form-wrapper">
        <div className="profile-form-section">
          <div className="profile-form-section-header">
            <UserIcon className="profile-form-section-icon" />
            <h3>{t('user.registry.profile_form.section.identity')}</h3>
          </div>
          <div className="profile-form-grid">
            <div className="profile-form-grid-item">
              <Label htmlFor="name">{t('user.registry.profile_form.label.display_name')}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name || ''}
                placeholder={t('user.registry.profile_form.placeholder.your_name')}
                data-testid="profile-display-name"
              />
            </div>
            <div className="profile-form-grid-item">
              <Label htmlFor="username">{t('user.registry.profile_form.label.username')}</Label>
              <Input
                id="username"
                name="username"
                defaultValue={user.username || ''}
                placeholder={t('user.registry.profile_form.placeholder.username') || 'Username'}
                data-testid="profile-username"
              />
            </div>
            <div className="profile-form-grid-item">
              <Label htmlFor="email">{t('user.registry.profile_form.label.email')}</Label>
              <Input
                id="email"
                name="email"
                defaultValue={user.email || ''}
                placeholder={t('user.registry.profile_form.placeholder.email')}
                data-testid="profile-email"
              />
            </div>
          </div>
        </div>

        <div className="profile-form-section">
          <div className="profile-form-section-header">
            <Lock className="profile-form-section-icon" />
            <h3>{t('user.registry.profile_form.section.security')}</h3>
          </div>
          <div className="profile-form-security-card">
            <div className="profile-form-grid-item">
              <Label htmlFor="password">{t('user.registry.profile_form.label.new_password')}</Label>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('user.registry.profile_form.placeholder.password_blank')}
                showStrengthMeter={!!password}
                data-testid="profile-new-password"
              />
            </div>
            {password && (
              <div className="profile-form-grid-item">
                <Label htmlFor="confirmPassword">
                  {t('user.registry.profile_form.label.confirm_password')}
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('user.registry.profile_form.placeholder.password_retype')}
                  data-testid="profile-confirm-password"
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="profile-form-error" data-testid="profile-form-error">
            {error}
          </div>
        )}
        {success && (
          <div className="profile-form-success" data-testid="profile-success">
            {success}
          </div>
        )}

        <div className="profile-form-footer">
          <Button
            type="submit"
            disabled={isPending || (!!password && password !== confirmPassword)}
            data-testid="profile-save-button"
          >
            {isPending && <Loader2 className="profile-form-submit-loader" />}
            {t('user.registry.profile_form.button.save')}
          </Button>
        </div>
      </form>

      {/* Delete Account Section - Only for PUBLIC mode */}
      {/* Note: In a real app we should pass this via props or context safely */}
      {(import.meta.env.PUBLIC_USER_MODE === 'PUBLIC' ||
        (!import.meta.env.PUBLIC_USER_MODE && !import.meta.env.USER_MODE)) && (
        <div className="profile-form-danger-zone">
          <div className="profile-form-danger-header">
            <UserIcon className="profile-form-danger-icon" />
            <h3>{t('user.registry.profile_form.section.danger_zone')}</h3>
          </div>
          <div className="profile-form-danger-card">
            <p className="profile-form-danger-text">
              {t('user.registry.profile_form.danger.text')}
            </p>
            <Button
              variant="destructive"
              data-testid="profile-delete-account-button"
              onClick={async () => {
                if (confirm(t('user.registry.profile_form.danger.confirm_title'))) {
                  const email = prompt(t('user.registry.profile_form.danger.confirm_prompt'));
                  if (email === user.email) {
                    // Call delete action
                    try {
                      await api.user.deleteMe();
                      window.location.href = '/login';
                    } catch (err: unknown) {
                      alert(
                        (err as ApiError).body?.error ||
                          t('user.registry.profile_form.error.delete_failed'),
                      );
                    }
                  } else {
                    alert(t('user.registry.profile_form.error.email_mismatch'));
                  }
                }
              }}
            >
              {t('user.registry.profile_form.button.delete')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

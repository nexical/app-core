/* eslint-disable */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/core/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import zxcvbn from 'zxcvbn';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthMeter?: boolean;
  showConfirm?: boolean; // If true, manages its own confirm field? better to keep separate or controlled.
  // Actually, for better composition, let's keep this as a single input with potential meter attached.
  // The consumer can use two instances for confirm flow.
  externalScore?: number; // If we want to control score from outside
  onScoreChange?: (score: number) => void;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrengthMeter, onScoreChange, onChange, ...props }, ref) => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = React.useState(false);
    const [strength, setStrength] = React.useState(0);
    const [feedback, setFeedback] = React.useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrengthMeter || onScoreChange) {
        const result = zxcvbn(e.target.value);
        setStrength(result.score);
        setFeedback(result.feedback.warning || result.feedback.suggestions[0] || '');
        if (onScoreChange) {
          onScoreChange(result.score);
        }
      }
      onChange?.(e);
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const getStrengthColor = (score: number) => {
      switch (score) {
        case 0:
          return 'password-strength-fill-0';
        case 1:
          return 'password-strength-fill-1';
        case 2:
          return 'password-strength-fill-2';
        case 3:
          return 'password-strength-fill-3';
        case 4:
          return 'password-strength-fill-4';
        default:
          return 'password-strength-fill-0';
      }
    };

    const getStrengthLabel = (score: number) => {
      switch (score) {
        case 0:
          return t('user.components.password_input.strength.too_weak');
        case 1:
          return t('user.components.password_input.strength.weak');
        case 2:
          return t('user.components.password_input.strength.fair');
        case 3:
          return t('user.components.password_input.strength.good');
        case 4:
          return t('user.components.password_input.strength.strong');
        default:
          return '';
      }
    };

    return (
      <div className="password-input-container">
        <div className="password-input-wrapper relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            className={cn('password-input-field', className)}
            ref={ref}
            onChange={handleChange}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="password-toggle-button absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="password-toggle-icon" />
            ) : (
              <Eye className="password-toggle-icon" />
            )}
            <span className="password-reader-only">
              {showPassword
                ? t('user.components.password_input.toggle.hide')
                : t('user.components.password_input.toggle.show')}
            </span>
          </Button>
        </div>

        {showStrengthMeter && props.value && String(props.value).length > 0 && (
          <div className="password-strength-meter">
            <div className="password-strength-bar-bg">
              <div
                className={cn('password-strength-bar-fill', getStrengthColor(strength))}
                style={{ width: `${(strength + 1) * 20}%` }}
              />
            </div>
            <div className="password-strength-text-container">
              <span
                className={cn(
                  'password-strength-label',
                  strength < 2 ? 'password-strength-label-weak' : 'password-strength-label-normal',
                )}
              >
                {getStrengthLabel(strength)}
              </span>
              {feedback && <span className="password-strength-feedback">{feedback}</span>}
            </div>
          </div>
        )}
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

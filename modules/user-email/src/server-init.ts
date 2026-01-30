import { EmailRegistry } from '@/lib/email/email-registry';
import InviteUserEmail from './emails/invite-user';
import VerifyEmail from './emails/verify-email';
import ResetPasswordEmail from './emails/reset-password';

export async function init() {
  EmailRegistry.register('user:invite', InviteUserEmail);
  EmailRegistry.register('user:verify-email', VerifyEmail);
  EmailRegistry.register('user:reset-password', ResetPasswordEmail);
}

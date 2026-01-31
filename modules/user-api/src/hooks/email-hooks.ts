import { HookSystem } from '@/lib/modules/hooks';
import { sendEmail } from '@/lib/email/email-sender';
import { EmailRegistry } from '@/lib/email/email-registry';
import { config } from '@/lib/core/config';
import { getTranslation } from '@/lib/core/i18n';
import { db } from '@/lib/core/db';

export class EmailHooks {
  static init() {
    // Handle User Registration / Verification
    HookSystem.on('user.created', async (event: { id: string }) => {
      const { id } = event;
      const user = await db.user.findUnique({ where: { id } });
      if (!user || user.emailVerified || !user.email) return;

      // Generate Verification Token
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.verificationToken.create({
        data: { identifier: user.email, token, expires },
      });

      const verifyUrl = `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/verify-email/${token}`;
      const translate = await getTranslation(config.PUBLIC_DEFAULT_LANGUAGE || 'en');

      // Render and Send
      await sendEmail({
        to: user.email,
        subject: translate('user.email.verify.subject', { siteName: config.PUBLIC_SITE_NAME }),
        html: await EmailRegistry.render('user:verify-email', {
          userName: user.name,
          verifyUrl,
          strings: {
            preview: translate('user.email.verify.preview', { siteName: config.PUBLIC_SITE_NAME }),
            greeting: translate('user.email.verify.greeting', { userName: user.name || 'User' }),
            body: translate('user.email.verify.body', { siteName: config.PUBLIC_SITE_NAME }),
            button: translate('user.email.verify.button'),
            or_copy: translate('user.email.verify.or_copy'),
            copyright: translate('user.email.layout.copyright', {
              year: new Date().getFullYear().toString(),
              siteName: config.PUBLIC_SITE_NAME,
            }),
          },
        }),
      });
    });

    // Handle Invitation
    HookSystem.on('invitation.created', async (event: { id: string }) => {
      const { id } = event;
      const invitation = await db.invitation.findUnique({ where: { id } });
      if (!invitation) return;

      const inviteUrl = `${process.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/register?token=${invitation.token}`;
      const translate = await getTranslation();
      const inviterName = translate('user.service.default_inviter_name');
      const workspaceName = config.PUBLIC_SITE_NAME;

      await sendEmail({
        to: invitation.email,
        subject: translate('user.email.invite.subject', { siteName: config.PUBLIC_SITE_NAME }),
        html: await EmailRegistry.render('user:invite', {
          inviteUrl,
          role: invitation.role,
          inviterName,
          workspaceName,
          strings: {
            preview: translate('user.email.invite.preview', {
              workspaceName,
              siteName: config.PUBLIC_SITE_NAME,
            }),
            greeting: translate('user.email.invite.greeting'),
            body: translate('user.email.invite.body', {
              inviterName,
              workspaceName,
              role: invitation.role,
            }), // Use invitation.role directly as string
            button: translate('user.email.invite.button'),
            or_copy: translate('user.email.invite.or_copy'),
            copyright: translate('user.email.layout.copyright', {
              year: new Date().getFullYear().toString(),
              siteName: config.PUBLIC_SITE_NAME,
            }),
          },
        }),
      });
    });
  }
}

export const init = () => EmailHooks.init();

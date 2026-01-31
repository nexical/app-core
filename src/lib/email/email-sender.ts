import { HookSystem } from '../modules/hooks';
import { config } from '../core/config';

interface Transporter {
  sendMail: (options: unknown) => Promise<{ messageId: string; response: string }>;
}

let transporter: Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Dynamic import to prevent client-side bundling
  const nodemailer = (await import('nodemailer')).default;
  const port = parseInt(process.env.SMTP_PORT || '465');

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }) as unknown as Transporter;
  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the configured SMTP transport.
 *
 * @param options - The email recipient, subject, and HTML content.
 * @returns An object indicating success and the message ID or an error.
 */
export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    // Mock Email for Tests/CI or if explicitly requested
    if (
      process.env.MOCK_EMAIL === 'true' ||
      process.env.CI === 'true' ||
      process.env.NODE_ENV === 'test'
    ) {
      console.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      await HookSystem.dispatch('core.email.sent', {
        to,
        subject,
        messageId: 'mock-id-' + Date.now(),
      });
      return { success: true, messageId: 'mock-id-' + Date.now() };
    }

    const transport = await getTransporter();
    const nodemailer = (await import('nodemailer')).default; // Need it for getTestMessageUrl if used, or just import again (cached module)

    const options = {
      from: process.env.EMAIL_FROM || `${config.PUBLIC_SITE_NAME} <noreply@example.com>`,
      to,
      subject,
      html,
    };

    if (process.env.NODE_ENV === 'development') {
      console.info(`[DEV MODE] Sending email to ${to} | Subject: ${subject}`);
    }

    const info = await transport!.sendMail(options);

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previewUrl = nodemailer.getTestMessageUrl(info as any);
      if (previewUrl) {
        console.info('Preview URL: %s', previewUrl);
      } else {
        console.info(`Email sent: ${info.messageId}`);
      }
    }

    // Log to file for agent verification (ALWAYS)
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.join(process.cwd(), 'email-debug.log');
    const logEntry = `\n--- EMAIL LOG [${new Date().toISOString()}] ---\nTo: ${to}\nSubject: ${subject}\nSMTP Host: ${process.env.SMTP_HOST}\nSMTP User: ${process.env.SMTP_USER}\nMessage ID: ${info.messageId}\nResponse: ${info.response}\n------------------------------------------\n`;
    try {
      fs.appendFileSync(logPath, logEntry);
    } catch (e: unknown) {
      console.error('Failed to write email log:', e);
    }

    await HookSystem.dispatch('core.email.sent', { to, subject, messageId: info.messageId });

    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Error sending email:', error);

    // Log error to file as well
    try {
      const fs = await import('fs');
      const path = await import('path');
      const logPath = path.join(process.cwd(), 'email-debug.log');
      const logEntry = `\n--- EMAIL ERROR [${new Date().toISOString()}] ---\nTo: ${to}\nSubject: ${subject}\nError: ${errorMessage}\nStack: ${errorStack}\n------------------------------------------\n`;
      fs.appendFileSync(logPath, logEntry);
    } catch (e: unknown) {
      console.error('Failed to write email error log:', e);
    }

    await HookSystem.dispatch('core.email.failed', { to, subject, error: errorMessage });

    return { success: false, error: errorMessage };
  }
};

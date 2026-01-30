import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies
const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123', response: 'OK' });
const mockCreateTransport = vi.fn().mockReturnValue({
  sendMail: mockSendMail,
});

vi.mock('nodemailer', () => ({
  default: {
    createTransport: mockCreateTransport,
    getTestMessageUrl: vi.fn().mockReturnValue('http://preview.url'),
  },
}));

vi.mock('fs', () => ({
  appendFileSync: vi.fn(),
}));

// Mock HookSystem
const mockDispatch = vi.fn();
vi.mock('@/lib/modules/hooks', () => ({
  HookSystem: {
    dispatch: mockDispatch,
  },
}));

describe('email-sender', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('MOCK_EMAIL', 'false');
    vi.stubEnv('CI', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should use mock email in test environment by default', async () => {
    const { sendEmail } = await import('@/lib/email/email-sender');
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hello', html: '<b>Hi</b>' });

    expect(result.success).toBe(true);
    expect(result.messageId).toContain('mock-id');
    expect(mockDispatch).toHaveBeenCalledWith(
      'core.email.sent',
      expect.objectContaining({ to: 'test@example.com' }),
    );
  });

  it('should use nodemailer when not in test/mock environment', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { sendEmail } = await import('@/lib/email/email-sender');

    const result = await sendEmail({
      to: 'real@example.com',
      subject: 'SMTP',
      html: '<i>SMTP</i>',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('123');
    expect(mockDispatch).toHaveBeenCalledWith(
      'core.email.sent',
      expect.objectContaining({ messageId: '123' }),
    );
  });

  it('should handle SMTP errors gracefully', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'));
    const { sendEmail } = await import('@/lib/email/email-sender');

    const result = await sendEmail({ to: 'fail@example.com', subject: 'Fail', html: 'FAIL' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('SMTP connection failed');
    expect(mockDispatch).toHaveBeenCalledWith(
      'core.email.failed',
      expect.objectContaining({ error: 'SMTP connection failed' }),
    );
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockAppendFileSync = vi.fn();
vi.mock('node:fs', () => ({
  default: { appendFileSync: mockAppendFileSync },
  appendFileSync: mockAppendFileSync,
}));

vi.mock('fs', () => ({
  default: { appendFileSync: mockAppendFileSync },
  appendFileSync: mockAppendFileSync,
}));

const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123', response: 'OK' });
const mockCreateTransport = vi.fn().mockReturnValue({ sendMail: mockSendMail });
const mockGetTestMessageUrl = vi.fn().mockReturnValue('http://preview.url');

vi.mock('nodemailer', () => ({
  default: {
    createTransport: mockCreateTransport,
    getTestMessageUrl: mockGetTestMessageUrl,
  },
}));

const mockDispatch = vi.fn();
vi.mock('@/lib/modules/hooks', () => ({
  HookSystem: { dispatch: mockDispatch },
}));

describe('email-sender', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('MOCK_EMAIL', 'false');
    vi.stubEnv('CI', 'false');
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should use mock email in test environment by default', async () => {
    const { sendEmail } = await import('@/lib/email/email-sender');
    const result = await sendEmail({ to: 'test@test.com', subject: 'Sub', html: '<b>H</b>' });
    expect(result.success).toBe(true);
    expect(result.messageId).toContain('mock-id');
  });

  it('should use nodemailer in development and cache transporter (line 11)', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { sendEmail } = await import('@/lib/email/email-sender');

    // First call caches the transporter
    await sendEmail({ to: '1@test.com', subject: 'Sub1', html: 'H1' });
    expect(mockCreateTransport).toHaveBeenCalledTimes(1);

    // Second call uses cached transporter (covers line 11)
    await sendEmail({ to: '2@test.com', subject: 'Sub2', html: 'H2' });
    expect(mockCreateTransport).toHaveBeenCalledTimes(1); // Still 1 !
  });

  it('should handle SMTP errors and log failures (Error branch)', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mockSendMail.mockRejectedValueOnce(new Error('SMTP failed'));
    mockAppendFileSync.mockImplementationOnce(() => {
      throw new Error('Disk full');
    });

    const { sendEmail } = await import('@/lib/email/email-sender');
    const result = await sendEmail({ to: 'f@test.com', subject: 'F', html: 'F' });

    expect(result.success).toBe(false);
    expect((result as unknown as { error: string }).error).toBe('SMTP failed');
    expect(mockAppendFileSync).toHaveBeenCalled();
  });

  it('should handle non-Error throws (line 99-100)', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mockSendMail.mockRejectedValueOnce('String Error');
    const { sendEmail } = await import('@/lib/email/email-sender');

    const result = await sendEmail({ to: 's@test.com', subject: 'S', html: 'S' });

    expect(result.success).toBe(false);
    expect(mockAppendFileSync).toHaveBeenCalled(); // Should log string error
  });

  it('should handle branch without preview URL (line 74)', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mockGetTestMessageUrl.mockReturnValue(null);
    const { sendEmail } = await import('@/lib/email/email-sender');

    await sendEmail({ to: 'dev@test.com', subject: 'No Preview', html: 'Test' });
    expect(mockGetTestMessageUrl).toHaveBeenCalled();
  });

  it('should handle failed file write for success case', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mockSendMail.mockResolvedValueOnce({ messageId: '456', response: 'OK' });
    mockAppendFileSync.mockImplementationOnce(() => {
      throw new Error('Permission');
    });

    const { sendEmail } = await import('@/lib/email/email-sender');
    const result = await sendEmail({ to: 'l@test.com', subject: 'L', html: 'Test' });
    expect(result.success).toBe(true);
  });

  it('should log preview URL in development mode if available', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    mockGetTestMessageUrl.mockReturnValue('http://ethereal.email/message/123');

    const { sendEmail } = await import('@/lib/email/email-sender');
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      html: 'html content',
    });

    expect(result.success).toBe(true);
    expect(mockGetTestMessageUrl).toHaveBeenCalled();
  });
});

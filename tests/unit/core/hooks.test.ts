import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HookSystem } from '../../../src/lib/modules/hooks';

// Mock DB because middleware might indirectly access it or just to be safe
vi.mock('@/lib/core/db', () => ({
    db: {}
}));

// Mock Nodemailer
const mocks = vi.hoisted(() => {
    return {
        sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-id' })
    };
});

vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn().mockReturnValue({
            sendMail: mocks.sendMail
        }),
        getTestMessageUrl: vi.fn(),
    }
}));

// Mock react-email
vi.mock('@react-email/render', () => ({
    render: vi.fn(() => '<html></html>'),
}));

// Mock fs to avoid file writing in tests
vi.mock('fs', () => ({
    appendFileSync: vi.fn(),
    promises: {
        writeFile: vi.fn(),
    }
}));


import { sendEmail } from '../../../src/lib/email/email-sender';
import { ServiceLocator } from '../../../src/lib/modules/service-locator';

describe('Core Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(HookSystem, 'dispatch');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should dispatch core.email.sent on successful email', async () => {
        await sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Hi</p>' });
        expect(HookSystem.dispatch).toHaveBeenCalledWith('core.email.sent', expect.objectContaining({
            to: 'test@example.com',
            subject: 'Test'
        }));
    });

    it('should dispatch core.email.failed on email error', async () => {
        vi.stubEnv('NODE_ENV', 'development'); // Force past the mock check
        mocks.sendMail.mockRejectedValueOnce(new Error('SMTP Error'));

        await sendEmail({ to: 'fail@example.com', subject: 'Fail', html: '<p>Bye</p>' });

        expect(HookSystem.dispatch).toHaveBeenCalledWith('core.email.failed', expect.objectContaining({
            to: 'fail@example.com',
            error: 'SMTP Error'
        }));

        vi.unstubAllEnvs();
    });

    it('should dispatch core.service.provided when service is provided', () => {
        ServiceLocator.provide('TestService', { foo: 'bar' });
        expect(HookSystem.dispatch).toHaveBeenCalledWith('core.service.provided', { name: 'TestService' });
    });
});

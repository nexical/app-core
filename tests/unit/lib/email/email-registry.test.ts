import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { EmailRegistry } from '@/lib/email/email-registry';

vi.mock('@react-email/render', () => ({
  render: vi.fn().mockReturnValue('<html>email</html>'),
}));

describe('EmailRegistry', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should register and retrieve a template', () => {
    const MockTemplate = () => React.createElement('div', null, 'Hello');
    EmailRegistry.register('test:id', MockTemplate);

    expect(EmailRegistry.get('test:id')).toBe(MockTemplate);
  });

  it('should return undefined for missing template', () => {
    expect(EmailRegistry.get('missing')).toBeUndefined();
  });

  it('should render a template to HTML', async () => {
    const MockTemplate = ({ name }: { name: string }) =>
      React.createElement('div', null, `Hello ${name}`);
    EmailRegistry.register('render:id', MockTemplate);

    const html = await EmailRegistry.render('render:id', { name: 'World' });
    expect(html).toBe('<html>email</html>');
  });

  it('should throw error if rendering missing template', async () => {
    await expect(EmailRegistry.render('unknown', {})).rejects.toThrow(
      'Email template not found: unknown',
    );
  });
});

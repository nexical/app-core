import { Button, Section, Text } from '@react-email/components';
import * as React from 'react';
import EmailLayout from './layout';
import { config } from '@/lib/core/config';

interface ResetPasswordEmailProps {
  userEmail?: string;
  resetUrl?: string;
  strings: {
    preview: string;
    greeting: string;
    body: string;
    button: string;
    or_copy: string;
    ignore: string;
    copyright: string;
  };
}

export const ResetPasswordEmail = ({
  userEmail = 'test@example.com',
  resetUrl = 'http://localhost:4321/reset-password',
  strings,
}: ResetPasswordEmailProps) => {
  const previewText = strings.preview;

  return (
    <EmailLayout preview={previewText} strings={{ copyright: strings.copyright }}>
      <Text className="text-email-text text-[14px] leading-[24px]">{strings.greeting}</Text>
      <Text className="text-email-text text-[14px] leading-[24px]">{strings.body}</Text>
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-email-btn-bg rounded text-email-btn-text text-[12px] font-semibold no-underline text-center px-5 py-3"
          href={resetUrl}
        >
          {strings.button}
        </Button>
      </Section>
      <Text className="text-email-text text-[14px] leading-[24px]">
        {strings.or_copy} <br />
        <a href={resetUrl} className="text-email-accent no-underline">
          {resetUrl}
        </a>
      </Text>
      <Text className="text-email-text-muted text-[12px] leading-[24px] mt-[20px]">
        {strings.ignore}
      </Text>
    </EmailLayout>
  );
};

export default ResetPasswordEmail;

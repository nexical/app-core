import {
    Button,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';
import EmailLayout from './layout';
import { config } from '@/lib/core/config';

interface InviteUserEmailProps {
    inviterName?: string;
    workspaceName?: string;
    role?: string;
    inviteUrl?: string;
    strings: {
        preview: string;
        greeting: string;
        body: string; // HTML string
        button: string;
        or_copy: string;
        copyright: string;
    };
}

export const InviteUserEmail = ({
    inviterName = 'Someone',
    workspaceName = 'their workspace',
    role = 'MEMBER',
    inviteUrl = 'http://localhost:4321/invite',
    strings
}: InviteUserEmailProps) => {
    const previewText = strings.preview;

    return (
        <EmailLayout preview={previewText} strings={{ copyright: strings.copyright }}>
            <Text className="text-email-text text-[14px] leading-[24px]">
                {strings.greeting}
            </Text>
            <Text className="text-email-text text-[14px] leading-[24px]" dangerouslySetInnerHTML={{ __html: strings.body }} />
            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-email-btn-bg rounded text-email-btn-text text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={inviteUrl}
                >
                    {strings.button}
                </Button>
            </Section>
            <Text className="text-email-text text-[14px] leading-[24px]">
                {strings.or_copy} <br />
                <a href={inviteUrl} className="text-email-accent no-underline">
                    {inviteUrl}
                </a>
            </Text>
        </EmailLayout>
    );
};

export default InviteUserEmail;

import {
    Body,
    Container,
    Head,
    Hr,
    Html,

    Preview,
    Section,
    Text,
    Tailwind,
    Img,
} from '@react-email/components';
import * as React from 'react';
import { config } from '@/lib/core/config';
import { emailTheme } from '@/lib/email/email-theme-config';

interface LayoutProps {
    preview?: string;
    children: React.ReactNode;
    strings: {
        copyright: string;
    };
}

export const EmailLayout = ({ preview, children, strings }: LayoutProps) => {
    // In Astro/Vite, import.meta.env is used, but for the React Email render (node context), process.env might be needed
    // or we might need to handle both. For safety in node scripts: process.env
    const baseUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

    return (
        <Html>
            <Head />
            {preview ? <Preview>{preview}</Preview> : null}
            <Tailwind config={{ theme: emailTheme }}>
                <Body className="bg-email-bg my-auto mx-auto font-sans">
                    <Container className="border border-solid border-email-border rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                src={`${baseUrl}/logo.png`}
                                width="50"
                                height="50"
                                alt={config.PUBLIC_SITE_NAME}
                                className="my-0 mx-auto"
                            />
                            <Text className="text-email-text text-[24px] font-semibold text-center p-0 my-[20px] mx-0">
                                {config.PUBLIC_SITE_NAME}
                            </Text>
                        </Section>

                        {children}

                        <Hr className="border border-solid border-email-border my-[26px] mx-0 w-full" />
                        <Text className="text-email-text-muted text-[12px] leading-[24px]">
                            {strings.copyright}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default EmailLayout;

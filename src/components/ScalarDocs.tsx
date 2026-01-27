import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

interface Props {
    spec: Record<string, any>;
}

export const ScalarDocs = ({ spec }: Props) => {
    const config = {
        content: spec,
        theme: 'none',
        layout: 'modern',
        hideClientButton: true,
    } as const;
    console.log('[ScalarDocs] Config:', config);

    return (
        <ApiReferenceReact
            configuration={config}
        />
    );
};

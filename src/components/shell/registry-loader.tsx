
import React, { useEffect, useState } from 'react';
import { getZoneComponents, type RegistryComponent } from '@/lib/ui/registry-loader';

interface RegistryLoaderProps {
    zone: string;
}

export function RegistryLoader({ zone }: RegistryLoaderProps) {
    const [components, setComponents] = useState<RegistryComponent[]>([]);

    useEffect(() => {
        getZoneComponents(zone).then(setComponents);
    }, [zone]);

    if (components.length === 0) return null;

    return (
        <>
            {components.map((item, idx) => {
                const Component = item.component;
                return <Component key={`${item.name}-${idx}`} />;
            })}
        </>
    );
}

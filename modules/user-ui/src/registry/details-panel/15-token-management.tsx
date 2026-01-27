import React from 'react';
import { TokenList } from '../../components/settings/token-list';

export default function TokenManagement(props: any) {
    return (
        <div className="space-y-6">
            <TokenList tokens={[]} />
        </div>
    );
}

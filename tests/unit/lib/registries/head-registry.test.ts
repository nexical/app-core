import { describe, it, expect, beforeEach } from 'vitest';
import { HeadRegistry } from '@/lib/registries/head-registry';

describe('HeadRegistry', () => {
    beforeEach(() => {
        HeadRegistry.clear();
    });

    it('should register and retrieve entries', () => {
        const entry: any = { tag: 'meta', props: { name: 'test' } };
        HeadRegistry.register(entry);

        expect(HeadRegistry.getEntries()).toContain(entry);
    });

    it('should dedupe based on key', () => {
        HeadRegistry.register({ tag: 'title', content: 'Title 1', key: 'title' });
        HeadRegistry.register({ tag: 'title', content: 'Title 2', key: 'title' });

        const entries = HeadRegistry.getEntries();
        expect(entries).toHaveLength(1);
        expect(entries[0].content).toBe('Title 2');
    });

    it('should combine keyed and unkeyed entries', () => {
        HeadRegistry.register({ tag: 'meta', key: 'k1' });
        HeadRegistry.register({ tag: 'meta' });

        expect(HeadRegistry.getEntries()).toHaveLength(2);
    });

    it('should clear entries', () => {
        HeadRegistry.register({ tag: 'meta' });
        HeadRegistry.clear();
        expect(HeadRegistry.getEntries()).toHaveLength(0);
    });
});

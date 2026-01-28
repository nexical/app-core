import { describe, it, expect } from 'vitest';
import { FooterRegistry } from '@/lib/registries/footer-registry';

describe('FooterRegistry', () => {
    it('should register and find a footer', () => {
        const MockComp = () => null;
        FooterRegistry.register('test', MockComp, '/test');

        const context = { url: new URL('http://localhost/test'), navData: {}, isMobile: false, width: 0, height: 0 };
        expect(FooterRegistry.find(context)).toBe(MockComp);
    });

    it('should support matching logic (similar to ShellRegistry)', () => {
        const SuffixComp = () => null;
        FooterRegistry.register('suffix', SuffixComp, '*.php');

        const context = { url: new URL('http://localhost/index.php'), navData: {}, isMobile: false, width: 0, height: 0 };
        expect(FooterRegistry.find(context)).toBe(SuffixComp);
    });

    it('should handle LIFO priority', () => {
        const C1 = () => null;
        const C2 = () => null;
        FooterRegistry.register('f1', C1, '*');
        FooterRegistry.register('f2', C2, '*');

        const context = { url: new URL('http://localhost/'), navData: {}, isMobile: false, width: 0, height: 0 };
        expect(FooterRegistry.find(context)).toBe(C2);
    });

    it('should get by name', () => {
        const Comp = () => null;
        FooterRegistry.register('named-f', Comp, '*');
        expect(FooterRegistry.get('named-f')).toBe(Comp);
    });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { FooterRegistry } from '@/lib/registries/footer-registry';

describe('FooterRegistry', () => {
    beforeEach(() => {
        FooterRegistry.clear();
    });
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

    it('should overwrite if name is already registered', () => {
        const C1 = () => null;
        const C2 = () => null;
        FooterRegistry.register('ov', C1, '*');
        FooterRegistry.register('ov', C2, '*');
        expect(FooterRegistry.get('ov')).toBe(C2);
    });

    it('should return undefined if no footer matches', () => {
        const context = { url: new URL('http://localhost/non-existent'), navData: {}, isMobile: false, width: 0, height: 0 };
        expect(FooterRegistry.find(context)).toBeUndefined();
    });

    it('should support function matchers', () => {
        const FnComp = () => null;
        FooterRegistry.register('fn-matcher', FnComp, (ctx) => ctx.url.pathname === '/fn');

        const context = { url: new URL('http://localhost/fn'), navData: {}, isMobile: false, width: 0, height: 0 };
        expect(FooterRegistry.find(context)).toBe(FnComp);
    });

    it('should support prefix matchers with /*', () => {
        const PrefixComp = () => null;
        FooterRegistry.register('prefix', PrefixComp, '/admin/*');

        const context = { url: new URL('http://localhost/admin/users'), navData: {}, isMobile: false, width: 0, height: 0 };
        expect(FooterRegistry.find(context)).toBe(PrefixComp);
    });

    it('should return false for unsupported matcher types', () => {
        const IllegalComp = () => null;
        // @ts-ignore - testing runtime safety for illegal input
        FooterRegistry.register('illegal', IllegalComp, 123);

        const context = { url: new URL('http://localhost/'), navData: {}, isMobile: false, width: 0, height: 0 };
        expect(FooterRegistry.find(context)).toBeUndefined();
    });
});

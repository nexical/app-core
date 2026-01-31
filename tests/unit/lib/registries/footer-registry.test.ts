import { describe, it, expect, beforeEach } from 'vitest';
import { FooterRegistry } from '@/lib/registries/footer-registry';
import { type ShellContext } from '@/lib/registries/shell-registry';

describe('FooterRegistry', () => {
  beforeEach(() => {
    FooterRegistry.clear();
  });

  it('should register and find a footer component', () => {
    const MockComp = () => null;
    FooterRegistry.register('test', MockComp, '/test');

    const context = {
      url: new URL('http://localhost/test'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(FooterRegistry.find(context)).toBe(MockComp);
  });

  it('should find the whole entry', () => {
    const MockComp = () => null;
    const condition = (ctx: ShellContext) => ctx.url.pathname === '/entry';
    FooterRegistry.register('entry', MockComp, condition);

    const context = {
      url: new URL('http://localhost/entry'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    const entry = FooterRegistry.findEntry(context);
    expect(entry?.name).toBe('entry');
    expect(entry?.component).toBe(MockComp);
  });

  it('should clear all footers', () => {
    FooterRegistry.register('something', () => null, '*');
    FooterRegistry.clear();
    const context = {
      url: new URL('http://localhost/'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(FooterRegistry.find(context)).toBeUndefined();
  });

  it('should support wildcard matching (*)', () => {
    const DefaultComp = () => null;
    FooterRegistry.register('default', DefaultComp, '*');

    const context = {
      url: new URL('http://localhost/anywhere'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(FooterRegistry.find(context)).toBe(DefaultComp);
  });

  it('should support prefix matching (/*)', () => {
    const UserComp = () => null;
    FooterRegistry.register('user', UserComp, '/user/*');

    const context = {
      url: new URL('http://localhost/user/profile'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(FooterRegistry.find(context)).toBe(UserComp);
  });

  it('should support suffix matching (*suffix)', () => {
    const HtmlComp = () => null;
    FooterRegistry.register('html', HtmlComp, '*.html');

    const context = {
      url: new URL('http://localhost/page.html'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(FooterRegistry.find(context)).toBe(HtmlComp);
  });

  it('should have LIFO priority (latest wins)', () => {
    const Comp1 = () => null;
    const Comp2 = () => null;
    FooterRegistry.register('c1', Comp1, '*');
    FooterRegistry.register('c2', Comp2, '*');

    const context = {
      url: new URL('http://localhost/'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(FooterRegistry.find(context)).toBe(Comp2);
  });

  it('should handle re-registration', () => {
    const Comp1 = () => null;
    const Comp2 = () => null;
    FooterRegistry.register('c1', Comp1, '*');
    FooterRegistry.register('c2', Comp2, '*');
    FooterRegistry.register('c1', Comp1, '*');

    const context = {
      url: new URL('http://localhost/'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(FooterRegistry.find(context)).toBe(Comp1);
  });

  it('should get by name', () => {
    const Comp = () => null;
    FooterRegistry.register('named', Comp, '/named');
    expect(FooterRegistry.get('named')).toBe(Comp);
  });

  it('should return false for unknown matcher types', () => {
    // @ts-expect-error - testing invalid configuration - testing runtime branch line 85
    FooterRegistry.register('wrong', () => null, 123);
    const context = {
      url: new URL('http://localhost/'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(FooterRegistry.find(context)).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { ShellRegistry } from '@/lib/registries/shell-registry';

describe('ShellRegistry', () => {
  it('should register and find a shell component', () => {
    const MockComp = () => null;
    ShellRegistry.register('test', MockComp, '/test');

    const context = {
      url: new URL('http://localhost/test'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(ShellRegistry.find(context)).toBe(MockComp);
  });

  it('should find the whole entry', () => {
    const MockComp = () => null;
    const condition = (ctx: any) => ctx.url.pathname === '/entry';
    ShellRegistry.register('entry', MockComp, condition);

    const context = {
      url: new URL('http://localhost/entry'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    const entry = ShellRegistry.findEntry(context);
    expect(entry?.name).toBe('entry');
    expect(entry?.component).toBe(MockComp);
  });

  it('should clear all shells', () => {
    ShellRegistry.register('something', () => null, '*');
    ShellRegistry.clear();
    const context = {
      url: new URL('http://localhost/'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(ShellRegistry.find(context)).toBeUndefined();
  });

  it('should support wildcard matching (*)', () => {
    const DefaultComp = () => null;
    ShellRegistry.register('default', DefaultComp, '*');

    const context = {
      url: new URL('http://localhost/anywhere'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(ShellRegistry.find(context)).toBe(DefaultComp);
  });

  it('should support prefix matching (/*)', () => {
    const UserComp = () => null;
    ShellRegistry.register('user', UserComp, '/user/*');

    const context = {
      url: new URL('http://localhost/user/profile'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(ShellRegistry.find(context)).toBe(UserComp);
  });

  it('should support suffix matching (*suffix)', () => {
    const HtmlComp = () => null;
    ShellRegistry.register('html', HtmlComp, '*.html');

    const context = {
      url: new URL('http://localhost/page.html'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(ShellRegistry.find(context)).toBe(HtmlComp);
  });

  it('should support function matching', () => {
    const MobileComp = () => null;
    ShellRegistry.register('mobile', MobileComp, (ctx) => ctx.isMobile);

    const context = {
      url: new URL('http://localhost/'),
      navData: {},
      isMobile: true,
      width: 0,
      height: 0,
    };
    expect(ShellRegistry.find(context)).toBe(MobileComp);
  });

  it('should have LIFO priority (latest wins)', () => {
    const Comp1 = () => null;
    const Comp2 = () => null;
    ShellRegistry.register('c1', Comp1, '*');
    ShellRegistry.register('c2', Comp2, '*'); // Same matcher, registered later

    const context = {
      url: new URL('http://localhost/'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(ShellRegistry.find(context)).toBe(Comp2);
  });

  it('should re-registering move to end of priority', () => {
    const Comp1 = () => null;
    const Comp2 = () => null;
    ShellRegistry.register('c1', Comp1, '*');
    ShellRegistry.register('c2', Comp2, '*');
    ShellRegistry.register('c1', Comp1, '*'); // Move c1 to end

    const context = {
      url: new URL('http://localhost/'),
      navData: {},
      isMobile: false,
      width: 0,
      height: 0,
    };
    expect(ShellRegistry.find(context)).toBe(Comp1);
  });

  it('should get by name', () => {
    const Comp = () => null;
    ShellRegistry.register('named', Comp, '/named');
    expect(ShellRegistry.get('named')).toBe(Comp);
  });
});

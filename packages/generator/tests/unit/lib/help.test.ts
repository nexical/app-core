import { describe, it, expect, vi } from 'vitest';
import { CustomHelp } from '@nexical/generator/lib/help';
import { Command, Argument, Option } from 'commander';
import chalk from 'chalk';

// Mock chalk to return plain strings for simpler assertions
vi.mock('chalk', () => {
    const handler = {
        get: () => handler,
        apply: (target: any, thisArg: any, args: any[]) => args[0], // Identiy
    };
    // Mock specific methods used if simple proxy isn't enough, but identity usually works for chalk if structure is simple
    // Actually, recursive proxy is safer. 
    // But since we want to assert content, let's just make it return string wrapper or just spy.
    // Let's assume real chalk output with regex checks.
    return { default: { bold: { underline: (s: string) => `[${s}]` }, green: (s: string) => s, yellow: (s: string) => s } };
});

describe('CustomHelp', () => {
    it('should format help output', () => {
        const cmd = new Command('test-cmd');
        cmd.description('A test command');
        cmd.argument('<arg>', 'An argument');
        cmd.option('-f, --flag', 'A flag');

        const output = CustomHelp.format(cmd, [
            { header: 'Examples', content: '$ test-cmd foo' }
        ]);

        expect(output).toContain('[Usage:]');
        expect(output).toContain('test-cmd [options] <arg>'); // Commander default usage format
        expect(output).toContain('[Description:]');
        expect(output).toContain('A test command');
        expect(output).toContain('[Arguments:]');
        expect(output).toContain('arg');
        expect(output).toContain('An argument');
        expect(output).toContain('[Options:]');
        expect(output).toContain('-f, --flag');
        expect(output).toContain('[Examples:]');
        expect(output).toContain('$ test-cmd foo');
    });
});

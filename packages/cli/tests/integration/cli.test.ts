import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('CLI Integration Tests', () => {
    let testConfigDir: string;
    let originalHome: string;

    beforeEach(() => {
        // Create temporary directory for testing
        testConfigDir = join(tmpdir(), `ssh-easy-test-${Date.now()}`);
        mkdirSync(testConfigDir, { recursive: true });

        // Mock the home directory
        originalHome = process.env.HOME || process.env.USERPROFILE || '';
        process.env.HOME = testConfigDir;
    });

    afterEach(() => {
        // Cleanup
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true, force: true });
        }
        process.env.HOME = originalHome;
    });

    const runCLI = (args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
        return new Promise(resolve => {
            const child = spawn('node', ['dist/cli.js', ...args], {
                cwd: join(process.cwd(), 'packages/cli'),
                env: { ...process.env, HOME: testConfigDir },
            });

            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', data => {
                stdout += data.toString();
            });

            child.stderr?.on('data', data => {
                stderr += data.toString();
            });

            child.on('close', code => {
                resolve({
                    stdout,
                    stderr,
                    exitCode: code || 0,
                });
            });
        });
    };

    describe('Help and Version', () => {
        it('should show help when --help is passed', async () => {
            const result = await runCLI(['--help']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('Simple and convenient SSH connection CLI tool');
            expect(result.stdout).toContain('Usage:');
            expect(result.stdout).toContain('Commands:');
        });

        it('should show version when --version is passed', async () => {
            const result = await runCLI(['--version']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toMatch(/\d+\.\d+\.\d+/); // Version format
        });
    });

    describe('List Command', () => {
        it('should show no hosts message when config is empty', async () => {
            const result = await runCLI(['list']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('No saved hosts found');
            expect(result.stdout).toContain('To add a host: simple-ssh add');
        });
    });

    describe('Command Aliases', () => {
        it('should accept ls as alias for list', async () => {
            const result = await runCLI(['ls']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('No saved hosts found');
        });

        it('should accept c as alias for connect', async () => {
            const result = await runCLI(['c', 'non-existing-host']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain("Host 'non-existing-host' not found");
        });

        it('should accept a as alias for add', async () => {
            // This would require interactive input, so we just test that the command is recognized
            // In a real scenario, we'd mock the inquirer prompts
            const result = await runCLI(['a', '--help']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('Add new SSH host');
        });

        it('should accept rm as alias for remove', async () => {
            const result = await runCLI(['rm', 'non-existing-host']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('No saved hosts found');
        });

        it('should accept e as alias for edit', async () => {
            const result = await runCLI(['e', 'non-existing-host']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain('No saved hosts found');
        });
    });

    describe('Error Handling', () => {
        it('should handle unknown commands gracefully', async () => {
            const result = await runCLI(['unknown-command']);

            expect(result.exitCode).toBe(1);
            expect(result.stderr).toContain('unknown command');
        });

        it('should handle connect to non-existing host', async () => {
            const result = await runCLI(['connect', 'non-existing-host']);

            expect(result.exitCode).toBe(0);
            expect(result.stdout).toContain("Host 'non-existing-host' not found");
        });
    });
});

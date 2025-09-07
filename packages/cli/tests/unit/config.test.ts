import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadConfig, saveConfig, addHost, removeHost, getHost } from '../../src/utils/config.js';
import type { SSHHost, SSHConfig } from '../../src/types/ssh.js';

describe('Config Management', () => {
    let testConfigDir: string;
    let originalConfigDir: string;

    beforeEach(() => {
        // Create temporary directory for testing
        testConfigDir = join(tmpdir(), `ssh-easy-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        mkdirSync(testConfigDir, { recursive: true });

        // Mock the config directory - ensure complete isolation
        originalConfigDir = process.env.HOME || process.env.USERPROFILE || '';
        process.env.HOME = testConfigDir;
        process.env.USERPROFILE = testConfigDir; // For Windows compatibility

        // 각 테스트마다 깨끗한 환경 보장
        process.env.USER = 'testuser'; // 일관된 테스트 환경
    });

    afterEach(() => {
        // Cleanup
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true, force: true });
        }
        process.env.HOME = originalConfigDir;
        process.env.USERPROFILE = originalConfigDir;

        // USER 환경변수도 복원
        if (originalConfigDir.includes('kangminsu')) {
            process.env.USER = 'kangminsu';
        }
    });

    describe('loadConfig', () => {
        it('should create default config when file does not exist', async () => {
            const config = await loadConfig();

            expect(config.hosts).toEqual([]);
            expect(config.defaultPort).toBe(22);
            expect(typeof config.defaultUser).toBe('string'); // 사용자명은 환경에 따라 다름
        });

        it('should load existing config file', async () => {
            const testConfig: SSHConfig = {
                hosts: [
                    {
                        name: 'test-host',
                        host: '192.168.1.100',
                        user: 'testuser',
                        port: 22,
                        keyPath: '/path/to/key',
                        description: 'Test host',
                        tags: ['test'],
                    },
                ],
                defaultUser: 'testuser',
                defaultPort: 22,
            };

            // Create config directory and file
            const configDir = join(testConfigDir, '.ssh-easy');
            mkdirSync(configDir, { recursive: true });
            writeFileSync(join(configDir, 'config.json'), JSON.stringify(testConfig, null, 2));

            const config = await loadConfig();
            expect(config).toEqual(testConfig);
        });
    });

    describe('addHost', () => {
        it('should add new host to empty config', async () => {
            const newHost: SSHHost = {
                name: 'new-host',
                host: '192.168.1.200',
                user: 'newuser',
                port: 22,
                keyPath: '/path/to/new/key',
                description: 'New test host',
                tags: ['new', 'test'],
            };

            await addHost(newHost);
            const config = await loadConfig();

            expect(config.hosts).toHaveLength(1);
            expect(config.hosts[0]).toEqual(newHost);
        });

        it('should replace existing host with same name', async () => {
            const host1: SSHHost = {
                name: 'same-name',
                host: '192.168.1.100',
                user: 'user1',
                port: 22,
            };

            const host2: SSHHost = {
                name: 'same-name',
                host: '192.168.1.200',
                user: 'user2',
                port: 2222,
            };

            await addHost(host1);
            await addHost(host2);

            const config = await loadConfig();
            // 같은 이름의 호스트는 하나만 있어야 함
            const sameNameHosts = config.hosts.filter(h => h.name === 'same-name');
            expect(sameNameHosts).toHaveLength(1);
            expect(sameNameHosts[0]).toEqual(host2);
        });
    });

    describe('removeHost', () => {
        it('should remove existing host', async () => {
            const host: SSHHost = {
                name: 'to-remove',
                host: '192.168.1.100',
                user: 'testuser',
                port: 22,
            };

            await addHost(host);
            const removed = await removeHost('to-remove');

            expect(removed).toBe(true);

            const config = await loadConfig();
            // 해당 이름의 호스트가 없어야 함
            const removedHost = config.hosts.find(h => h.name === 'to-remove');
            expect(removedHost).toBeUndefined();
        });

        it('should return false for non-existing host', async () => {
            const removed = await removeHost('non-existing');
            expect(removed).toBe(false);
        });
    });

    describe('getHost', () => {
        it('should return host by name', async () => {
            const host: SSHHost = {
                name: 'find-me',
                host: '192.168.1.100',
                user: 'testuser',
                port: 22,
            };

            await addHost(host);
            const found = await getHost('find-me');

            expect(found).toEqual(host);
        });

        it('should return undefined for non-existing host', async () => {
            const found = await getHost('non-existing');
            expect(found).toBeUndefined();
        });
    });
});

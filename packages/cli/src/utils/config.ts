import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { SSHConfig, SSHHost } from '../types/ssh.js';

// 테스트 환경에서 HOME 환경변수를 우선 사용
function getHomeDir(): string {
    return process.env.HOME || process.env.USERPROFILE || homedir();
}

function getConfigDir(): string {
    return join(getHomeDir(), '.ssh-easy');
}

function getConfigFile(): string {
    return join(getConfigDir(), 'config.json');
}

const DEFAULT_CONFIG: SSHConfig = {
    hosts: [],
    defaultUser: process.env.USER || 'root',
    defaultPort: 22,
};

export async function ensureConfigDir(): Promise<void> {
    const configDir = getConfigDir();
    if (!existsSync(configDir)) {
        await mkdir(configDir, { recursive: true });
    }
}

export async function loadConfig(): Promise<SSHConfig> {
    await ensureConfigDir();

    const configFile = getConfigFile();
    if (!existsSync(configFile)) {
        await saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
    }

    try {
        const content = await readFile(configFile, 'utf-8');
        const config = JSON.parse(content) as SSHConfig;

        // 기본값 병합
        return {
            ...DEFAULT_CONFIG,
            ...config,
            hosts: config.hosts || [],
        };
    } catch (error) {
        console.error('설정 파일을 읽는 중 오류가 발생했습니다:', error);
        return DEFAULT_CONFIG;
    }
}

export async function saveConfig(config: SSHConfig): Promise<void> {
    await ensureConfigDir();

    try {
        await writeFile(getConfigFile(), JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error('설정 파일을 저장하는 중 오류가 발생했습니다:', error);
        throw error;
    }
}

export async function addHost(host: SSHHost): Promise<void> {
    const config = await loadConfig();

    // 중복 이름 체크
    const existingIndex = config.hosts.findIndex(h => h.name === host.name);
    if (existingIndex >= 0) {
        config.hosts[existingIndex] = host;
    } else {
        config.hosts.push(host);
    }

    await saveConfig(config);
}

export async function removeHost(name: string): Promise<boolean> {
    const config = await loadConfig();
    const initialLength = config.hosts.length;

    config.hosts = config.hosts.filter(h => h.name !== name);

    if (config.hosts.length < initialLength) {
        await saveConfig(config);
        return true;
    }

    return false;
}

export async function getHost(name: string): Promise<SSHHost | undefined> {
    const config = await loadConfig();
    return config.hosts.find(h => h.name === name);
}

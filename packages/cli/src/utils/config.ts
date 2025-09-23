import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { SSHConfig, SSHHost } from '../types/ssh.js';

// Use HOME environment variable first for test environments
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

        // Merge default values
        return {
            ...DEFAULT_CONFIG,
            ...config,
            hosts: config.hosts || [],
        };
    } catch (error) {
        console.error('Error reading configuration file:', error);
        return DEFAULT_CONFIG;
    }
}

export async function saveConfig(config: SSHConfig): Promise<void> {
    await ensureConfigDir();

    try {
        await writeFile(getConfigFile(), JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving configuration file:', error);
        throw error;
    }
}

export async function addHost(host: SSHHost): Promise<void> {
    const config = await loadConfig();

    // Check for duplicate names
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

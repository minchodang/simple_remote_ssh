import inquirer from 'inquirer';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { addHost, loadConfig } from '../utils/config.js';
import type { SSHHost } from '../types/ssh.js';

export async function addCommand() {
    console.log(chalk.blue('➕ Add new SSH host'));
    console.log();

    const config = await loadConfig();

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Host name (alias):',
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return 'Please enter a host name.';
                }

                // Check for duplicates
                const exists = config.hosts.some(h => h.name === input.trim());
                if (exists) {
                    return `Host name '${input.trim()}' already exists. Please choose a different name.`;
                }

                return true;
            },
            filter: (input: string) => (input ? input.trim() : ''),
        },
        {
            type: 'input',
            name: 'host',
            message: 'Host address (IP or domain):',
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return 'Please enter a host address.';
                }
                return true;
            },
            filter: (input: string) => (input ? input.trim() : ''),
        },
        {
            type: 'input',
            name: 'user',
            message: 'Username:',
            default: config.defaultUser || process.env.USER || 'root',
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return 'Please enter a username.';
                }
                return true;
            },
            filter: (input: string) => (input ? input.trim() : ''),
        },
        {
            type: 'input',
            name: 'port',
            message: 'Port number:',
            default: config.defaultPort?.toString() || '22',
            validate: (input: string) => {
                const port = parseInt(input);
                if (isNaN(port) || port < 1 || port > 65535) {
                    return 'Please enter a valid port number (1-65535).';
                }
                return true;
            },
            filter: (input: string) => parseInt(input),
        },
        {
            type: 'list',
            name: 'authMethod',
            message: 'Select authentication method:',
            choices: [
                { name: 'SSH key file (recommended)', value: 'key' },
                { name: 'Password (prompt on connect)', value: 'password' },
                { name: 'Default SSH settings', value: 'default' },
            ],
            default: 'key',
        },
        {
            type: 'input',
            name: 'keyPath',
            message: 'SSH key file path:',
            when: answers => answers.authMethod === 'key',
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return 'Please enter SSH key file path.';
                }
                if (!existsSync(input.trim())) {
                    return 'The specified key file does not exist.';
                }
                return true;
            },
            filter: (input: string) => (input && input.trim() ? input.trim() : undefined),
        },
        {
            type: 'input',
            name: 'description',
            message: 'Description (optional):',
            filter: (input: string) => (input && input.trim() ? input.trim() : undefined),
        },
        {
            type: 'input',
            name: 'tags',
            message: 'Tags (comma-separated, optional):',
            filter: (input: string) => {
                if (!input || !input.trim()) return undefined;
                return input
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
            },
        },
    ]);

    const newHost: SSHHost = {
        name: answers.name,
        host: answers.host,
        user: answers.user,
        port: answers.port,
        keyPath: answers.authMethod === 'key' ? answers.keyPath : undefined,
        usePassword: answers.authMethod === 'password',
        description: answers.description,
        tags: answers.tags,
    };

    try {
        await addHost(newHost);

        console.log();
        console.log(chalk.green('✅ Host added successfully!'));
        console.log();
        console.log(chalk.blue('📋 Host information:'));
        console.log(`   ${chalk.cyan('Name:')} ${newHost.name}`);
        console.log(`   ${chalk.cyan('Address:')} ${newHost.user}@${newHost.host}:${newHost.port}`);
        if (newHost.keyPath) {
            console.log(`   ${chalk.cyan('Key file:')} ${newHost.keyPath}`);
        }
        if (newHost.description) {
            console.log(`   ${chalk.cyan('Description:')} ${newHost.description}`);
        }
        if (newHost.tags && newHost.tags.length > 0) {
            console.log(`   ${chalk.cyan('Tags:')} ${newHost.tags.join(', ')}`);
        }
        console.log();
        console.log(chalk.blue('💡 To connect:'), chalk.gray(`simple-ssh connect ${newHost.name}`));
    } catch (error) {
        console.log(chalk.red('❌ Error adding host:'), error);
    }
}

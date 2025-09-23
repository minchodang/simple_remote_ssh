import inquirer from 'inquirer';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { loadConfig, addHost, getHost } from '../utils/config.js';
import type { SSHHost } from '../types/ssh.js';

export async function editCommand(hostName?: string) {
    const config = await loadConfig();

    if (config.hosts.length === 0) {
        console.log(chalk.yellow('⚠️  No saved hosts found.'));
        return;
    }

    let targetHostName = hostName;

    if (!targetHostName) {
        // Host selection
        const { selectedHost } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedHost',
                message: 'Select host to edit:',
                choices: [
                    ...config.hosts.map(host => ({
                        name: `${chalk.cyan(host.name)} - ${host.user}@${host.host}:${host.port}`,
                        value: host.name,
                    })),
                    new inquirer.Separator(),
                    {
                        name: chalk.gray('Cancel'),
                        value: null,
                    },
                ],
            },
        ]);

        if (!selectedHost) {
            console.log(chalk.blue('Cancelled.'));
            return;
        }

        targetHostName = selectedHost;
    }

    if (!targetHostName) {
        console.log(chalk.red('❌ Host name not specified.'));
        return;
    }

    const targetHost = await getHost(targetHostName);
    if (!targetHost) {
        console.log(chalk.red(`❌ Host '${targetHostName}' not found.`));
        return;
    }

    console.log(chalk.blue(`✏️  Edit host '${targetHost.name}'`));
    console.log(chalk.dim('(Press Enter to keep current value)'));
    console.log();

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Host name (alias):',
            default: targetHost.name,
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return 'Please enter a host name.';
                }

                // Check for duplicates with other hosts
                if (input.trim() !== targetHost.name) {
                    const exists = config.hosts.some(h => h.name === input.trim());
                    if (exists) {
                        return `Host name '${input.trim()}' already exists. Please choose a different name.`;
                    }
                }

                return true;
            },
            filter: (input: string) => (input ? input.trim() : ''),
        },
        {
            type: 'input',
            name: 'host',
            message: 'Host address (IP or domain):',
            default: targetHost.host,
            validate: (input: string) => {
                if (!input.trim()) {
                    return 'Please enter a host address.';
                }
                return true;
            },
            filter: (input: string) => input.trim(),
        },
        {
            type: 'input',
            name: 'user',
            message: 'Username:',
            default: targetHost.user,
            validate: (input: string) => {
                if (!input.trim()) {
                    return 'Please enter a username.';
                }
                return true;
            },
            filter: (input: string) => input.trim(),
        },
        {
            type: 'input',
            name: 'port',
            message: 'Port number:',
            default: targetHost.port.toString(),
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
            default: () => {
                if (targetHost.keyPath) return 'key';
                if (targetHost.usePassword) return 'password';
                return 'default';
            },
        },
        {
            type: 'input',
            name: 'keyPath',
            message: 'SSH key file path:',
            when: answers => answers.authMethod === 'key',
            default: targetHost.keyPath || '',
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
            default: targetHost.description || '',
            filter: (input: string) => input.trim() || undefined,
        },
        {
            type: 'input',
            name: 'tags',
            message: 'Tags (comma-separated, optional):',
            default: targetHost.tags ? targetHost.tags.join(', ') : '',
            filter: (input: string) => {
                if (!input.trim()) return undefined;
                return input
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
            },
        },
        {
            type: 'confirm',
            name: 'hasAutoCommands',
            message: '자동 실행 명령어를 수정하시겠습니까?',
            default: !!(targetHost.autoCommands && targetHost.autoCommands.length > 0),
        },
        {
            type: 'editor',
            name: 'autoCommandsInput',
            message: '자동 실행할 명령어들을 입력하세요 (한 줄에 하나씩):',
            default: targetHost.autoCommands ? targetHost.autoCommands.join('\n') : '',
            when: answers => answers.hasAutoCommands,
        },
    ]);

    // 자동 명령어 처리
    let autoCommands: string[] | undefined = undefined;
    if (answers.hasAutoCommands && answers.autoCommandsInput) {
        autoCommands = answers.autoCommandsInput
            .split('\n')
            .map((cmd: string) => cmd.trim())
            .filter((cmd: string) => cmd.length > 0);
    }

    const updatedHost: SSHHost = {
        name: answers.name,
        host: answers.host,
        user: answers.user,
        port: answers.port,
        keyPath: answers.authMethod === 'key' ? answers.keyPath : undefined,
        usePassword: answers.authMethod === 'password',
        autoCommands: autoCommands,
        description: answers.description,
        tags: answers.tags,
    };

    try {
        await addHost(updatedHost);

        console.log(chalk.green('✅ Host updated successfully!'));
        console.log();
        console.log(chalk.blue('📋 Updated host information:'));
        console.log(`   ${chalk.cyan('Name:')} ${updatedHost.name}`);
        console.log(`   ${chalk.cyan('Address:')} ${updatedHost.user}@${updatedHost.host}:${updatedHost.port}`);
        if (updatedHost.keyPath) {
            console.log(`   ${chalk.cyan('Key file:')} ${updatedHost.keyPath}`);
        }
        if (updatedHost.description) {
            console.log(`   ${chalk.cyan('Description:')} ${updatedHost.description}`);
        }
        if (updatedHost.tags && updatedHost.tags.length > 0) {
            console.log(`   ${chalk.cyan('Tags:')} ${updatedHost.tags.join(', ')}`);
        }
        if (updatedHost.autoCommands && updatedHost.autoCommands.length > 0) {
            console.log(`   ${chalk.cyan('자동 명령어:')} ${updatedHost.autoCommands.length}개`);
            updatedHost.autoCommands.forEach((cmd, index) => {
                console.log(`     ${chalk.dim(`${index + 1}.`)} ${chalk.yellow(cmd)}`);
            });
        }
        console.log();
        console.log(chalk.blue('💡 To connect:'), chalk.gray(`simple-ssh connect ${updatedHost.name}`));
    } catch (error) {
        console.log(chalk.red('❌ Error updating host:'), error);
    }
}

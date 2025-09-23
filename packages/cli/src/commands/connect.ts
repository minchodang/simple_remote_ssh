import { spawn } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadConfig, getHost } from '../utils/config.js';
import { createHostChoices } from '../utils/display.js';
import type { ConnectionOptions } from '../types/ssh.js';

export async function connectCommand(hostName?: string, options: ConnectionOptions = {}) {
    const config = await loadConfig();

    let targetHost;

    if (hostName) {
        // Host name specified
        targetHost = await getHost(hostName);
        if (!targetHost) {
            console.log(chalk.red(`❌ Host '${hostName}' not found.`));
            return;
        }
    } else {
        // Host selection
        if (config.hosts.length === 0) {
            console.log(chalk.yellow('⚠️  No saved hosts found.'));
            console.log(chalk.blue('💡 Add a host first: simple-ssh add'));
            return;
        }

        const { selectedHost } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedHost',
                message: 'Select a host to connect:',
                choices: createHostChoices(config.hosts),
            },
        ]);

        targetHost = await getHost(selectedHost);
    }

    if (!targetHost) {
        console.log(chalk.red('❌ Host not found.'));
        return;
    }

    // Apply connection options
    const user = options.user || targetHost.user;
    const port = options.port ? parseInt(options.port) : targetHost.port;

    console.log(chalk.blue(`🔗 Connecting to ${targetHost.name}...`));
    console.log(chalk.gray(`   ${user}@${targetHost.host}:${port}`));

    // Build SSH command
    const sshArgs = ['-p', port.toString()];

    // Add key file if specified
    if (targetHost.keyPath) {
        sshArgs.unshift('-i', targetHost.keyPath);
    }

    // Check for auto commands
    const hasAutoCommands = targetHost.autoCommands && targetHost.autoCommands.length > 0;

    if (hasAutoCommands) {
        console.log(chalk.blue(`🤖 Auto commands configured (${targetHost.autoCommands!.length} commands):`));
        targetHost.autoCommands!.forEach((cmd, index) => {
            console.log(`   ${chalk.dim(`${index + 1}.`)} ${chalk.yellow(cmd)}`);
        });
        console.log();

        // Combine auto commands and add bash for interactive session
        const commandString = targetHost.autoCommands!.join(' && ') + '; bash';
        sshArgs.push(`${user}@${targetHost.host}`, commandString);
    } else {
        // Regular interactive connection
        sshArgs.push(`${user}@${targetHost.host}`);
    }

    // Show password prompt info
    if (targetHost.usePassword) {
        console.log(chalk.yellow('💡 This host uses password authentication. Please enter password when prompted.'));
    }

    console.log(chalk.green(`✅ Starting SSH connection...`));
    console.log(chalk.gray(`Command: ssh ${sshArgs.join(' ')}`));
    console.log();

    // Execute SSH process
    const sshProcess = spawn('ssh', sshArgs, {
        stdio: 'inherit',
        shell: false,
    });

    sshProcess.on('error', error => {
        console.log(chalk.red(`❌ SSH connection failed: ${error.message}`));
    });

    sshProcess.on('exit', code => {
        if (code === 0) {
            console.log(chalk.green('✅ SSH connection closed.'));
        } else {
            console.log(chalk.yellow(`⚠️  SSH connection closed with code ${code}.`));
        }
    });
}

import chalk from 'chalk';
import type { SSHHost } from '../types/ssh.js';

/**
 * Display host information in a formatted way
 */
export function displayHostInfo(host: SSHHost, title = 'Host information'): void {
    console.log();
    console.log(chalk.blue(`📋 ${title}:`));
    console.log(`   ${chalk.cyan('Name:')} ${host.name}`);
    console.log(`   ${chalk.cyan('Address:')} ${host.user}@${host.host}:${host.port}`);

    if (host.keyPath) {
        console.log(`   ${chalk.cyan('Key file:')} ${host.keyPath}`);
    }

    if (host.description) {
        console.log(`   ${chalk.cyan('Description:')} ${host.description}`);
    }

    if (host.tags && host.tags.length > 0) {
        console.log(`   ${chalk.cyan('Tags:')} ${host.tags.join(', ')}`);
    }

    if (host.autoCommands && host.autoCommands.length > 0) {
        console.log(`   ${chalk.cyan('Auto commands:')} ${host.autoCommands.length} command(s)`);
        host.autoCommands.forEach((cmd, index) => {
            console.log(`     ${chalk.dim(`${index + 1}.`)} ${chalk.yellow(cmd)}`);
        });
    }

    console.log();
    console.log(chalk.blue('💡 To connect:'), chalk.gray(`simple-ssh connect ${host.name}`));
}

/**
 * Create host selection choices for inquirer
 */
export function createHostChoices(hosts: SSHHost[]) {
    return hosts.map(host => ({
        name: `${chalk.cyan(host.name)} - ${host.user}@${host.host}:${host.port}${host.description ? ` (${host.description})` : ''}`,
        value: host.name,
    }));
}

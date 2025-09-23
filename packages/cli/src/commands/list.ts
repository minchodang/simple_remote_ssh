import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export async function listCommand() {
    const config = await loadConfig();

    if (config.hosts.length === 0) {
        console.log(chalk.yellow('⚠️  No saved hosts found.'));
        console.log(chalk.blue('💡 To add a host: simple-ssh add'));
        return;
    }

    console.log(chalk.blue('📋 Saved SSH hosts:'));
    console.log();

    config.hosts.forEach((host, index) => {
        const nameColor = chalk.cyan.bold(host.name);
        const connectionInfo = chalk.gray(`${host.user}@${host.host}:${host.port}`);
        const description = host.description ? chalk.dim(` - ${host.description}`) : '';
        const tags = host.tags && host.tags.length > 0 ? chalk.magenta(` [${host.tags.join(', ')}]`) : '';

        console.log(`${chalk.dim(`${index + 1}.`)} ${nameColor} ${connectionInfo}${description}${tags}`);

        if (host.keyPath) {
            console.log(`   ${chalk.dim('🔑 Key:')} ${chalk.yellow(host.keyPath)}`);
        } else if (host.usePassword) {
            console.log(`   ${chalk.dim('🔒 Auth:')} ${chalk.cyan('Password')}`);
        } else {
            console.log(`   ${chalk.dim('🔧 Auth:')} ${chalk.gray('Default SSH settings')}`);
        }
    if (host.autoCommands && host.autoCommands.length > 0) {
      console.log(`   ${chalk.dim('🤖 자동 명령어:')} ${chalk.magenta(`${host.autoCommands.length}개`)}`);
    }
    });

    console.log();
    console.log(chalk.dim(`Total ${config.hosts.length} host(s) saved.`));
    console.log();
    console.log(chalk.blue('💡 Usage:'));
    console.log(chalk.dim('  Connect: simple-ssh connect <hostname> or simple-ssh c <hostname>'));
    console.log(chalk.dim('  Edit: simple-ssh edit <hostname> or simple-ssh e <hostname>'));
    console.log(chalk.dim('  Remove: simple-ssh remove <hostname> or simple-ssh rm <hostname>'));
}

import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export async function listCommand() {
    const config = await loadConfig();

    if (config.hosts.length === 0) {
        console.log(chalk.yellow('⚠️  저장된 호스트가 없습니다.'));
        console.log(chalk.blue('💡 호스트를 추가하려면: ssh-easy add'));
        return;
    }

    console.log(chalk.blue('📋 저장된 SSH 호스트 목록:'));
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
            console.log(`   ${chalk.dim('🔒 Auth:')} ${chalk.cyan('비밀번호')}`);
        } else {
            console.log(`   ${chalk.dim('🔧 Auth:')} ${chalk.gray('기본 SSH 설정')}`);
        }
    });

    console.log();
    console.log(chalk.dim(`총 ${config.hosts.length}개의 호스트가 저장되어 있습니다.`));
    console.log();
    console.log(chalk.blue('💡 사용법:'));
    console.log(chalk.dim('  연결: ssh-easy connect <호스트명> 또는 ssh-easy c <호스트명>'));
    console.log(chalk.dim('  편집: ssh-easy edit <호스트명> 또는 ssh-easy e <호스트명>'));
    console.log(chalk.dim('  삭제: ssh-easy remove <호스트명> 또는 ssh-easy rm <호스트명>'));
}

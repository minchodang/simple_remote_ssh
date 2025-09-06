import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadConfig, removeHost, getHost } from '../utils/config.js';

export async function removeCommand(hostName?: string) {
    const config = await loadConfig();

    if (config.hosts.length === 0) {
        console.log(chalk.yellow('⚠️  저장된 호스트가 없습니다.'));
        return;
    }

    let targetHostName = hostName;

    if (!targetHostName) {
        // 호스트 선택
        const { selectedHost } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedHost',
                message: '삭제할 호스트를 선택하세요:',
                choices: [
                    ...config.hosts.map(host => ({
                        name: `${chalk.cyan(host.name)} - ${host.user}@${host.host}:${host.port}`,
                        value: host.name,
                    })),
                    new inquirer.Separator(),
                    {
                        name: chalk.gray('취소'),
                        value: null,
                    },
                ],
            },
        ]);

        if (!selectedHost) {
            console.log(chalk.blue('취소되었습니다.'));
            return;
        }

        targetHostName = selectedHost;
    }

    if (!targetHostName) {
        console.log(chalk.red('❌ 호스트 이름이 지정되지 않았습니다.'));
        return;
    }

    const targetHost = await getHost(targetHostName);
    if (!targetHost) {
        console.log(chalk.red(`❌ 호스트 '${targetHostName}'을 찾을 수 없습니다.`));
        return;
    }

    // 삭제 확인
    console.log();
    console.log(chalk.yellow('⚠️  다음 호스트를 삭제하시겠습니까?'));
    console.log(`   ${chalk.cyan('이름:')} ${targetHost.name}`);
    console.log(`   ${chalk.cyan('주소:')} ${targetHost.user}@${targetHost.host}:${targetHost.port}`);
    if (targetHost.description) {
        console.log(`   ${chalk.cyan('설명:')} ${targetHost.description}`);
    }
    console.log();

    const { confirmed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: '정말로 삭제하시겠습니까?',
            default: false,
        },
    ]);

    if (!confirmed) {
        console.log(chalk.blue('취소되었습니다.'));
        return;
    }

    try {
        const success = await removeHost(targetHostName);

        if (success) {
            console.log(chalk.green(`✅ 호스트 '${targetHostName}'이 성공적으로 삭제되었습니다.`));
        } else {
            console.log(chalk.red(`❌ 호스트 '${targetHostName}' 삭제에 실패했습니다.`));
        }
    } catch (error) {
        console.log(chalk.red('❌ 호스트 삭제 중 오류가 발생했습니다:'), error);
    }
}

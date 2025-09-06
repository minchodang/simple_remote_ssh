import inquirer from 'inquirer';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { loadConfig, addHost, getHost } from '../utils/config.js';
import type { SSHHost } from '../types/ssh.js';

export async function editCommand(hostName?: string) {
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
                message: '편집할 호스트를 선택하세요:',
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

    console.log(chalk.blue(`✏️  호스트 '${targetHost.name}' 편집`));
    console.log(chalk.dim('(변경하지 않으려면 Enter를 누르세요)'));
    console.log();

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '호스트 이름 (별칭):',
            default: targetHost.name,
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return '호스트 이름을 입력해주세요.';
                }

                // 현재 호스트가 아닌 다른 호스트와 중복 체크
                if (input.trim() !== targetHost.name) {
                    const exists = config.hosts.some(h => h.name === input.trim());
                    if (exists) {
                        return `'${input.trim()}' 이름은 이미 사용 중입니다. 다른 이름을 선택해주세요.`;
                    }
                }

                return true;
            },
            filter: (input: string) => (input ? input.trim() : ''),
        },
        {
            type: 'input',
            name: 'host',
            message: '호스트 주소 (IP 또는 도메인):',
            default: targetHost.host,
            validate: (input: string) => {
                if (!input.trim()) {
                    return '호스트 주소를 입력해주세요.';
                }
                return true;
            },
            filter: (input: string) => input.trim(),
        },
        {
            type: 'input',
            name: 'user',
            message: '사용자명:',
            default: targetHost.user,
            validate: (input: string) => {
                if (!input.trim()) {
                    return '사용자명을 입력해주세요.';
                }
                return true;
            },
            filter: (input: string) => input.trim(),
        },
        {
            type: 'input',
            name: 'port',
            message: '포트 번호:',
            default: targetHost.port.toString(),
            validate: (input: string) => {
                const port = parseInt(input);
                if (isNaN(port) || port < 1 || port > 65535) {
                    return '올바른 포트 번호를 입력해주세요 (1-65535).';
                }
                return true;
            },
            filter: (input: string) => parseInt(input),
        },
        {
            type: 'list',
            name: 'authMethod',
            message: '인증 방식을 선택하세요:',
            choices: [
                { name: 'SSH 키 파일 사용 (권장)', value: 'key' },
                { name: '비밀번호 사용 (연결 시 입력)', value: 'password' },
                { name: '기본 SSH 설정 사용', value: 'default' },
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
            message: 'SSH 키 파일 경로:',
            when: answers => answers.authMethod === 'key',
            default: targetHost.keyPath || '',
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return 'SSH 키 파일 경로를 입력해주세요.';
                }
                if (!existsSync(input.trim())) {
                    return '지정한 키 파일이 존재하지 않습니다.';
                }
                return true;
            },
            filter: (input: string) => (input && input.trim() ? input.trim() : undefined),
        },
        {
            type: 'input',
            name: 'description',
            message: '설명 (선택사항):',
            default: targetHost.description || '',
            filter: (input: string) => input.trim() || undefined,
        },
        {
            type: 'input',
            name: 'tags',
            message: '태그 (쉼표로 구분, 선택사항):',
            default: targetHost.tags ? targetHost.tags.join(', ') : '',
            filter: (input: string) => {
                if (!input.trim()) return undefined;
                return input
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
            },
        },
    ]);

    const updatedHost: SSHHost = {
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
        await addHost(updatedHost);

        console.log();
        console.log(chalk.green('✅ 호스트가 성공적으로 수정되었습니다!'));
        console.log();
        console.log(chalk.blue('📋 수정된 호스트 정보:'));
        console.log(`   ${chalk.cyan('이름:')} ${updatedHost.name}`);
        console.log(`   ${chalk.cyan('주소:')} ${updatedHost.user}@${updatedHost.host}:${updatedHost.port}`);
        if (updatedHost.keyPath) {
            console.log(`   ${chalk.cyan('키 파일:')} ${updatedHost.keyPath}`);
        }
        if (updatedHost.description) {
            console.log(`   ${chalk.cyan('설명:')} ${updatedHost.description}`);
        }
        if (updatedHost.tags && updatedHost.tags.length > 0) {
            console.log(`   ${chalk.cyan('태그:')} ${updatedHost.tags.join(', ')}`);
        }
        console.log();
        console.log(chalk.blue('💡 연결하려면:'), chalk.gray(`simple-ssh connect ${updatedHost.name}`));
    } catch (error) {
        console.log(chalk.red('❌ 호스트 수정 중 오류가 발생했습니다:'), error);
    }
}

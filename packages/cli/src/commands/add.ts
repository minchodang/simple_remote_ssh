import inquirer from 'inquirer';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { addHost, loadConfig } from '../utils/config.js';
import type { SSHHost } from '../types/ssh.js';

export async function addCommand() {
    console.log(chalk.blue('➕ 새로운 SSH 호스트 추가'));
    console.log();

    const config = await loadConfig();

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '호스트 이름 (별칭):',
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return '호스트 이름을 입력해주세요.';
                }

                // 중복 체크
                const exists = config.hosts.some(h => h.name === input.trim());
                if (exists) {
                    return `'${input.trim()}' 이름은 이미 사용 중입니다. 다른 이름을 선택해주세요.`;
                }

                return true;
            },
            filter: (input: string) => (input ? input.trim() : ''),
        },
        {
            type: 'input',
            name: 'host',
            message: '호스트 주소 (IP 또는 도메인):',
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return '호스트 주소를 입력해주세요.';
                }
                return true;
            },
            filter: (input: string) => (input ? input.trim() : ''),
        },
        {
            type: 'input',
            name: 'user',
            message: '사용자명:',
            default: config.defaultUser || process.env.USER || 'root',
            validate: (input: string) => {
                if (!input || !input.trim()) {
                    return '사용자명을 입력해주세요.';
                }
                return true;
            },
            filter: (input: string) => (input ? input.trim() : ''),
        },
        {
            type: 'input',
            name: 'port',
            message: '포트 번호:',
            default: config.defaultPort?.toString() || '22',
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
            default: 'key',
        },
        {
            type: 'input',
            name: 'keyPath',
            message: 'SSH 키 파일 경로:',
            when: answers => answers.authMethod === 'key',
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
            filter: (input: string) => (input && input.trim() ? input.trim() : undefined),
        },
        {
            type: 'input',
            name: 'tags',
            message: '태그 (쉼표로 구분, 선택사항):',
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
        console.log(chalk.green('✅ 호스트가 성공적으로 추가되었습니다!'));
        console.log();
        console.log(chalk.blue('📋 추가된 호스트 정보:'));
        console.log(`   ${chalk.cyan('이름:')} ${newHost.name}`);
        console.log(`   ${chalk.cyan('주소:')} ${newHost.user}@${newHost.host}:${newHost.port}`);
        if (newHost.keyPath) {
            console.log(`   ${chalk.cyan('키 파일:')} ${newHost.keyPath}`);
        }
        if (newHost.description) {
            console.log(`   ${chalk.cyan('설명:')} ${newHost.description}`);
        }
        if (newHost.tags && newHost.tags.length > 0) {
            console.log(`   ${chalk.cyan('태그:')} ${newHost.tags.join(', ')}`);
        }
        console.log();
        console.log(chalk.blue('💡 연결하려면:'), chalk.gray(`simple-ssh connect ${newHost.name}`));
    } catch (error) {
        console.log(chalk.red('❌ 호스트 추가 중 오류가 발생했습니다:'), error);
    }
}

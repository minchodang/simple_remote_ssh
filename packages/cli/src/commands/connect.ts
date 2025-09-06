import { spawn } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, getHost } from '../utils/config.js';
import type { ConnectionOptions } from '../types/ssh.js';

export async function connectCommand(hostName?: string, options: ConnectionOptions = {}) {
    const config = await loadConfig();

    let targetHost;

    if (hostName) {
        // 호스트 이름이 지정된 경우
        targetHost = await getHost(hostName);
        if (!targetHost) {
            console.log(chalk.red(`❌ 호스트 '${hostName}'을 찾을 수 없습니다.`));
            return;
        }
    } else {
        // 호스트 선택
        if (config.hosts.length === 0) {
      console.log(chalk.yellow('⚠️  저장된 호스트가 없습니다.'));
      console.log(chalk.blue('💡 먼저 호스트를 추가해보세요: simple-ssh add'));
            return;
        }

        const { selectedHost } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedHost',
                message: '연결할 호스트를 선택하세요:',
                choices: config.hosts.map(host => ({
                    name: `${chalk.cyan(host.name)} - ${host.user}@${host.host}:${host.port}${host.description ? ` (${host.description})` : ''}`,
                    value: host.name,
                })),
            },
        ]);

        targetHost = await getHost(selectedHost);
    }

    if (!targetHost) {
        console.log(chalk.red('❌ 호스트를 찾을 수 없습니다.'));
        return;
    }

    // 연결 옵션 적용
    const user = options.user || targetHost.user;
    const port = options.port ? parseInt(options.port) : targetHost.port;

    console.log(chalk.blue(`🔗 ${targetHost.name}에 연결 중...`));
    console.log(chalk.gray(`   ${user}@${targetHost.host}:${port}`));

    const spinner = ora('SSH 연결 시도 중...').start();

    // SSH 명령어 구성
    const sshArgs = ['-p', port.toString(), `${user}@${targetHost.host}`];

    // 키 파일이 있으면 추가
    if (targetHost.keyPath) {
        sshArgs.unshift('-i', targetHost.keyPath);
    }

    // 비밀번호 사용 시 대화형 모드 강제
    if (targetHost.usePassword) {
        console.log(chalk.yellow('💡 비밀번호를 사용하는 호스트입니다. 연결 후 비밀번호를 입력해주세요.'));
    }

    spinner.stop();

    console.log(chalk.green(`✅ SSH 연결을 시작합니다...`));
    console.log(chalk.gray(`실행 명령어: ssh ${sshArgs.join(' ')}`));
    console.log();

    // SSH 프로세스 실행
    const sshProcess = spawn('ssh', sshArgs, {
        stdio: 'inherit',
        shell: false,
    });

    sshProcess.on('error', error => {
        console.log(chalk.red(`❌ SSH 연결 실패: ${error.message}`));
    });

    sshProcess.on('exit', code => {
        if (code === 0) {
            console.log(chalk.green('✅ SSH 연결이 종료되었습니다.'));
        } else {
            console.log(chalk.yellow(`⚠️  SSH 연결이 코드 ${code}로 종료되었습니다.`));
        }
    });
}

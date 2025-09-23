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
        // Host name specified
        targetHost = await getHost(hostName);
        if (!targetHost) {
            console.log(chalk.red(`❌ Host '${hostName}' not found.`));
            return;
        }
    } else {
        // Host selection
        if (config.hosts.length === 0) {
            console.log(chalk.yellow('⚠️  저장된 호스트가 없습니다.'));
            console.log(chalk.blue('💡 먼저 호스트를 추가해보세요: simple-ssh add'));
            console.log(chalk.yellow('⚠️  No saved hosts found.'));
            console.log(chalk.blue('💡 Add a host first: simple-ssh add'));
            return;
        }

        const { selectedHost } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedHost',
                message: 'Select a host to connect:',
                choices: config.hosts.map(host => ({
                    name: `${chalk.cyan(host.name)} - ${host.user}@${host.host}:${host.port}${host.description ? ` (${host.description})` : ''}`,
                    value: host.name,
                })),
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

    // SSH 명령어 구성
    const sshArgs = ['-p', port.toString()];
    const spinner = ora('Attempting SSH connection...').start();
     const sshArgs = ['-p', port.toString()];
     // SSH 명령어 구성

    // 키 파일이 있으면 추가
    if (targetHost.keyPath) {
        sshArgs.unshift('-i', targetHost.keyPath);
    }
    // Build SSH command
    const sshArgs = ['-p', port.toString(), `${user}@${targetHost.host}`];
     // 자동 명령어가 있는지 확인
     const hasAutoCommands = targetHost.autoCommands && targetHost.autoCommands.length > 0;
     
     if (hasAutoCommands) {
         console.log(chalk.blue(`🤖 자동 명령어 ${targetHost.autoCommands!.length}개가 설정되어 있습니다:`));
         targetHost.autoCommands!.forEach((cmd, index) => {
             console.log(`   ${chalk.dim(`${index + 1}.`)} ${chalk.yellow(cmd)}`);
         });
         console.log();
         
         // 자동 명령어들을 세미콜론으로 연결하고 마지막에 bash 추가 (대화형 세션 유지)
         const commandString = targetHost.autoCommands!.join('; ') + '; bash';
         sshArgs.push(`${user}@${targetHost.host}`, commandString);
     } else {
         // 일반 대화형 연결
         sshArgs.push(`${user}@${targetHost.host}`);
     }

    // 자동 명령어가 있는지 확인
    const hasAutoCommands = targetHost.autoCommands && targetHost.autoCommands.length > 0;
    // Add key file if specified
    if (targetHost.keyPath) {
        sshArgs.unshift('-i', targetHost.keyPath);
    }

    if (hasAutoCommands) {
        console.log(chalk.blue(`🤖 자동 명령어 ${targetHost.autoCommands!.length}개가 설정되어 있습니다:`));
        targetHost.autoCommands!.forEach((cmd, index) => {
            console.log(`   ${chalk.dim(`${index + 1}.`)} ${chalk.yellow(cmd)}`);
        });
        console.log();

        // 자동 명령어만 실행 (대화형 세션은 별도로)
        const commandString = targetHost.autoCommands!.join(' && ');
        sshArgs.push(`${user}@${targetHost.host}`, commandString);
    } else {
        // 일반 대화형 연결
        sshArgs.push(`${user}@${targetHost.host}`);
    }

    // 비밀번호 사용 시 대화형 모드 강제
    if (targetHost.usePassword) {
        console.log(chalk.yellow('💡 비밀번호를 사용하는 호스트입니다. 연결 후 비밀번호를 입력해주세요.'));
    }

    console.log(chalk.green(`✅ SSH 연결을 시작합니다...`));
    console.log(chalk.gray(`실행 명령어: ssh ${sshArgs.join(' ')}`));
    // Show password prompt info
    if (targetHost.usePassword) {
        console.log(chalk.yellow('💡 This host uses password authentication. Please enter password when prompted.'));
    }

    spinner.stop();

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

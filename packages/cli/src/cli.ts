#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { connectCommand } from './commands/connect.js';
import { listCommand } from './commands/list.js';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { editCommand } from './commands/edit.js';

const program = new Command();

program
  .name('simple-ssh')
  .description('🚀 Simple and convenient SSH connection CLI tool')
  .version('0.1.0');

// 연결 명령어
program
  .command('connect [host]')
  .alias('c')
  .description('SSH 호스트에 연결합니다')
  .option('-u, --user <user>', '사용자명 지정')
  .option('-p, --port <port>', '포트 지정', '22')
  .action(connectCommand);

// 호스트 목록 보기
program
  .command('list')
  .alias('ls')
  .description('저장된 SSH 호스트 목록을 보여줍니다')
  .action(listCommand);

// 호스트 추가
program
  .command('add')
  .alias('a')
  .description('새로운 SSH 호스트를 추가합니다')
  .action(addCommand);

// 호스트 제거
program
  .command('remove [host]')
  .alias('rm')
  .description('SSH 호스트를 제거합니다')
  .action(removeCommand);

// 호스트 편집
program
  .command('edit [host]')
  .alias('e')
  .description('SSH 호스트 설정을 편집합니다')
  .action(editCommand);

// 기본 동작 (호스트 선택 후 연결)
program
  .action(async () => {
    console.log(chalk.blue('🚀 Simple SSH - 간편한 SSH 연결 도구'));
    console.log(chalk.gray('사용법: simple-ssh <command>'));
    console.log();
    
    // 호스트가 없으면 대화형 연결
    await connectCommand();
  });

program.parse();

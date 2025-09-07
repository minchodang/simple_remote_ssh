#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { connectCommand } from './commands/connect.js';
import { listCommand } from './commands/list.js';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { editCommand } from './commands/edit.js';

const program = new Command();

program.name('simple-ssh').description('🚀 Simple and convenient SSH connection CLI tool').version('0.1.0');

// Connect command
program
    .command('connect [host]')
    .alias('c')
    .description('Connect to SSH host')
    .option('-u, --user <user>', 'Specify username')
    .option('-p, --port <port>', 'Specify port', '22')
    .action(connectCommand);

// List hosts command
program.command('list').alias('ls').description('Show saved SSH hosts').action(listCommand);

// Add host command
program.command('add').alias('a').description('Add new SSH host').action(addCommand);

// Remove host command
program.command('remove [host]').alias('rm').description('Remove SSH host').action(removeCommand);

// Edit host command
program.command('edit [host]').alias('e').description('Edit SSH host settings').action(editCommand);

// Default action (interactive host selection)
program.action(async () => {
    console.log(chalk.blue('🚀 Simple SSH - Easy SSH connection tool'));
    console.log(chalk.gray('Usage: simple-ssh <command>'));
    console.log();

    // Interactive connection if no host specified
    await connectCommand();
});

program.parse();

import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadConfig, removeHost, getHost } from '../utils/config.js';
import { createHostChoices } from '../utils/display.js';

export async function removeCommand(hostName?: string) {
    const config = await loadConfig();

    if (config.hosts.length === 0) {
        console.log(chalk.yellow('⚠️  No saved hosts found.'));
        return;
    }

    let targetHostName = hostName;

    if (!targetHostName) {
        // Host selection
        const { selectedHost } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedHost',
                message: 'Select host to remove:',
                choices: [
                    ...createHostChoices(config.hosts),
                    new inquirer.Separator(),
                    {
                        name: chalk.gray('Cancel'),
                        value: null,
                    },
                ],
            },
        ]);

        if (!selectedHost) {
            console.log(chalk.blue('Cancelled.'));
            return;
        }

        targetHostName = selectedHost;
    }

    if (!targetHostName) {
        console.log(chalk.red('❌ Host name not specified.'));
        return;
    }

    const targetHost = await getHost(targetHostName);
    if (!targetHost) {
        console.log(chalk.red(`❌ Host '${targetHostName}' not found.`));
        return;
    }

    // Deletion confirmation
    console.log();
    console.log(chalk.yellow('⚠️  Are you sure you want to delete this host?'));
    console.log(`   ${chalk.cyan('Name:')} ${targetHost.name}`);
    console.log(`   ${chalk.cyan('Address:')} ${targetHost.user}@${targetHost.host}:${targetHost.port}`);
    if (targetHost.description) {
        console.log(`   ${chalk.cyan('Description:')} ${targetHost.description}`);
    }
    console.log();

    const { confirmed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: 'Are you sure you want to delete this host?',
            default: false,
        },
    ]);

    if (!confirmed) {
        console.log(chalk.blue('Cancelled.'));
        return;
    }

    try {
        const success = await removeHost(targetHostName);

        if (success) {
            console.log(chalk.green(`✅ Host '${targetHostName}' has been successfully removed.`));
        } else {
            console.log(chalk.red(`❌ Failed to remove host '${targetHostName}'.`));
        }
    } catch (error) {
        console.log(chalk.red('❌ Error occurred while removing host:'), error);
    }
}

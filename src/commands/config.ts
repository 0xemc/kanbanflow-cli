/**
 * Configuration commands
 */

import { Command } from 'commander';
import { getApiToken, setApiToken, loadConfig } from '../utils/config';
import chalk from 'chalk';
import inquirer from 'inquirer';

export function createConfigCommand(): Command {
  const config = new Command('config');
  config.description('Configuration management');

  config
    .command('set-token')
    .description('Set API token')
    .argument('[token]', 'API token (optional, will prompt if not provided)')
    .action(async (token?: string) => {
      let apiToken = token;

      if (!apiToken) {
        const answers = await inquirer.prompt([
          {
            type: 'password',
            name: 'token',
            message: 'Enter your KanbanFlow API token:',
            validate: (input) => input.trim().length > 0 || 'API token is required',
          },
        ]);
        apiToken = answers.token;
      }

      if (!apiToken) {
        console.error(chalk.red('Error: API token is required'));
        process.exit(1);
      }

      setApiToken(apiToken);
      console.log(chalk.green('✓ API token saved successfully'));
      console.log(chalk.gray('Token is stored in ~/.kanbanflow-cli/config.json'));
    });

  config
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const cfg = loadConfig();
      const token = getApiToken();

      console.log(chalk.bold('\n📋 Current Configuration\n'));

      if (token) {
        const masked = token.substring(0, 4) + '***' + token.substring(token.length - 4);
        console.log(`API Token: ${chalk.green(masked)}`);
        if (process.env.KANBANFLOW_API_TOKEN) {
          console.log(chalk.gray('  (from environment variable)'));
        } else {
          console.log(chalk.gray('  (from config file)'));
        }
      } else {
        console.log(chalk.red('API Token: Not configured'));
        console.log(chalk.gray('  Run "kanban config set-token" to configure'));
      }

      console.log(`Base URL: ${cfg.baseUrl || chalk.gray('https://kanbanflow.com/api/v1 (default)')}\n`);
    });

  return config;
}

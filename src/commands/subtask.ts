/**
 * Subtask commands
 */

import { Command } from 'commander';
import { KanbanFlowClient } from '../api/client';
import { getApiToken } from '../utils/config';
import { SubTask } from '../types';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

export function createSubtaskCommand(): Command {
  const subtask = new Command('subtask');
  subtask.description('Subtask operations');

  subtask
    .command('add <taskId>')
    .description('Add a subtask to a task')
    .option('-n, --name <name>', 'Subtask name')
    .option('-f, --finished', 'Mark as finished')
    .option('-i, --index <index>', 'Insert at index', parseInt)
    .action(async (taskId: string, options) => {
      const apiToken = getApiToken();
      if (!apiToken) {
        console.error(chalk.red('Error: API token not configured. Run "kanban config set-token" first.'));
        process.exit(1);
      }

      const client = new KanbanFlowClient(apiToken);

      try {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Subtask name:',
            when: !options.name,
            validate: (input) => input.trim().length > 0 || 'Subtask name is required',
          },
        ]);

        const subtaskData: SubTask = {
          name: options.name || answers.name,
          finished: options.finished || false,
        };

        const spinner = ora('Adding subtask...').start();
        const result = await client.addSubtask(taskId, subtaskData, options.index);
        spinner.succeed(`Subtask added at index ${result.insertIndex}`);
      } catch (error: any) {
        console.error(chalk.red('Failed to add subtask:'), error.message);
        process.exit(1);
      }
    });

  subtask
    .command('update <taskId> <index>')
    .description('Update a subtask')
    .option('-n, --name <name>', 'Subtask name')
    .option('-f, --finished <finished>', 'Finished status (true/false)')
    .action(async (taskId: string, index: string, options) => {
      const apiToken = getApiToken();
      if (!apiToken) {
        console.error(chalk.red('Error: API token not configured. Run "kanban config set-token" first.'));
        process.exit(1);
      }

      const updates: Partial<SubTask> = {};
      if (options.name) updates.name = options.name;
      if (options.finished !== undefined) updates.finished = options.finished === 'true';

      if (Object.keys(updates).length === 0) {
        console.error(chalk.red('No updates specified'));
        process.exit(1);
      }

      const spinner = ora('Updating subtask...').start();
      const client = new KanbanFlowClient(apiToken);

      try {
        await client.updateSubtask(taskId, parseInt(index), updates);
        spinner.succeed('Subtask updated successfully');
      } catch (error: any) {
        spinner.fail('Failed to update subtask');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  return subtask;
}

/**
 * Task commands
 */

import { Command } from 'commander';
import { KanbanFlowClient } from '../api/client';
import { getApiToken } from '../utils/config';
import { formatTask, formatColumnWithTasks } from '../utils/format';
import { CreateTaskRequest, TaskColor } from '../types';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

export function createTaskCommand(): Command {
  const task = new Command('task');
  task.description('Task operations');

  // List tasks
  task
    .command('list')
    .description('List all tasks by column')
    .option('-c, --column <columnId>', 'Filter by column ID')
    .option('-s, --swimlane <swimlaneId>', 'Filter by swimlane ID')
    .action(async (options) => {
      const apiToken = getApiToken();
      if (!apiToken) {
        console.error(chalk.red('Error: API token not configured. Run "kanban config set-token" first.'));
        process.exit(1);
      }

      const spinner = ora('Loading tasks...').start();
      const client = new KanbanFlowClient(apiToken);

      try {
        if (options.column && options.swimlane) {
          const tasks = await client.getTasksBySwimlaneAndColumn(options.swimlane, options.column);
          spinner.stop();
          tasks.forEach(t => console.log(formatTask(t)));
        } else if (options.column) {
          const tasks = await client.getTasksByColumn(options.column);
          spinner.stop();
          tasks.forEach(t => console.log(formatTask(t)));
        } else {
          const allTasks = await client.getAllTasks();
          const board = await client.getBoard();
          spinner.stop();

          board.columns.forEach(column => {
            const tasks = allTasks[column.uniqueId] || [];
            console.log(formatColumnWithTasks(column, tasks));
          });
        }
      } catch (error: any) {
        spinner.fail('Failed to load tasks');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  // Show task details
  task
    .command('show <taskId>')
    .description('Show task details')
    .action(async (taskId: string) => {
      const apiToken = getApiToken();
      if (!apiToken) {
        console.error(chalk.red('Error: API token not configured. Run "kanban config set-token" first.'));
        process.exit(1);
      }

      const spinner = ora('Loading task...').start();
      const client = new KanbanFlowClient(apiToken);

      try {
        const taskData = await client.getTask(taskId, true);
        spinner.stop();
        console.log(formatTask(taskData, true));
      } catch (error: any) {
        spinner.fail('Failed to load task');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  // Create task
  task
    .command('create')
    .description('Create a new task')
    .option('-n, --name <name>', 'Task name')
    .option('-c, --column <columnId>', 'Column ID or index')
    .option('-s, --swimlane <swimlaneId>', 'Swimlane ID (if applicable)')
    .option('-d, --description <description>', 'Task description')
    .option('--color <color>', 'Task color (yellow, red, green, blue, etc.)')
    .option('-p, --points <points>', 'Story points estimate', parseInt)
    .option('-t, --time <seconds>', 'Time estimate in seconds', parseInt)
    .option('--position <position>', 'Position (top, bottom, or number)')
    .option('-l, --labels <labels>', 'Comma-separated list of label names')
    .action(async (options) => {
      const apiToken = getApiToken();
      if (!apiToken) {
        console.error(chalk.red('Error: API token not configured. Run "kanban config set-token" first.'));
        process.exit(1);
      }

      const client = new KanbanFlowClient(apiToken);

      try {
        // Interactive prompts for missing required fields
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Task name:',
            when: !options.name,
            validate: (input) => input.trim().length > 0 || 'Task name is required',
          },
          {
            type: 'input',
            name: 'column',
            message: 'Column ID:',
            when: !options.column,
            validate: (input) => input.trim().length > 0 || 'Column ID is required',
          },
        ]);

        const taskData: CreateTaskRequest = {
          name: options.name || answers.name,
          columnId: options.column || answers.column,
        };

        if (options.swimlane) taskData.swimlaneId = options.swimlane;
        if (options.description) taskData.description = options.description;
        if (options.color) taskData.color = options.color as TaskColor;
        if (options.points) taskData.pointsEstimate = options.points;
        if (options.time) taskData.totalSecondsEstimate = options.time;
        if (options.position) {
          const pos = options.position;
          taskData.position = isNaN(Number(pos)) ? pos : Number(pos);
        }
        if (options.labels) {
          taskData.labels = options.labels.split(',').map((name: string) => ({
            name: name.trim(),
            pinned: false,
          }));
        }

        const spinner = ora('Creating task...').start();
        const result = await client.createTask(taskData);
        spinner.succeed(`Task created: ${result.taskId}${result.number ? ` (#${result.number})` : ''}`);
      } catch (error: any) {
        console.error(chalk.red('Failed to create task:'), error.message);
        process.exit(1);
      }
    });

  // Update task
  task
    .command('update <taskId>')
    .description('Update a task')
    .option('-n, --name <name>', 'Task name')
    .option('-c, --column <columnId>', 'Column ID')
    .option('-d, --description <description>', 'Task description')
    .option('--color <color>', 'Task color')
    .option('-p, --points <points>', 'Story points estimate', parseInt)
    .option('-t, --time <seconds>', 'Time estimate in seconds', parseInt)
    .option('-l, --labels <labels>', 'Comma-separated list of label names')
    .action(async (taskId: string, options) => {
      const apiToken = getApiToken();
      if (!apiToken) {
        console.error(chalk.red('Error: API token not configured. Run "kanban config set-token" first.'));
        process.exit(1);
      }

      const updates: any = {};
      if (options.name) updates.name = options.name;
      if (options.column) updates.columnId = options.column;
      if (options.description) updates.description = options.description;
      if (options.color) updates.color = options.color;
      if (options.points !== undefined) updates.pointsEstimate = options.points;
      if (options.time !== undefined) updates.totalSecondsEstimate = options.time;
      if (options.labels) {
        updates.labels = options.labels.split(',').map((name: string) => ({
          name: name.trim(),
          pinned: false,
        }));
      }

      if (Object.keys(updates).length === 0) {
        console.error(chalk.red('No updates specified'));
        process.exit(1);
      }

      const spinner = ora('Updating task...').start();
      const client = new KanbanFlowClient(apiToken);

      try {
        await client.updateTask(taskId, updates);
        spinner.succeed('Task updated successfully');
      } catch (error: any) {
        spinner.fail('Failed to update task');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  return task;
}

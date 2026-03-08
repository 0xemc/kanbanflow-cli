#!/usr/bin/env node

/**
 * KanbanFlow CLI
 * A command-line interface for the KanbanFlow API
 */

import { Command } from 'commander';
import { createBoardCommand } from './commands/board';
import { createTaskCommand } from './commands/task';
import { createConfigCommand } from './commands/config';
import { createSubtaskCommand } from './commands/subtask';
import chalk from 'chalk';

const program = new Command();

program
  .name('kanban')
  .description('KanbanFlow CLI - Manage your KanbanFlow tasks from the command line')
  .version('1.0.0');

// Register commands
program.addCommand(createConfigCommand());
program.addCommand(createBoardCommand());
program.addCommand(createTaskCommand());
program.addCommand(createSubtaskCommand());

// Help customization
program.on('--help', () => {
  console.log('');
  console.log(chalk.bold('Examples:'));
  console.log('  $ kanban config set-token');
  console.log('  $ kanban board show');
  console.log('  $ kanban task list');
  console.log('  $ kanban task create --name "New task" --column C9LIn5sEEpqT');
  console.log('  $ kanban task show T3s6UGyzY');
  console.log('');
  console.log(chalk.gray('For more information, visit: https://kanbanflow.com/api'));
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

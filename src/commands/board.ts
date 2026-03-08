/**
 * Board commands
 */

import { Command } from 'commander';
import { KanbanFlowClient } from '../api/client';
import { getApiToken } from '../utils/config';
import { formatBoard } from '../utils/format';
import chalk from 'chalk';
import ora from 'ora';

export function createBoardCommand(): Command {
  const board = new Command('board');
  board.description('Board operations');

  board
    .command('show')
    .description('Show board structure')
    .action(async () => {
      const apiToken = getApiToken();
      if (!apiToken) {
        console.error(chalk.red('Error: API token not configured. Run "kanban config set-token" first.'));
        process.exit(1);
      }

      const spinner = ora('Loading board...').start();
      const client = new KanbanFlowClient(apiToken);

      try {
        const boardData = await client.getBoard();
        spinner.stop();
        console.log(formatBoard(boardData));
      } catch (error: any) {
        spinner.fail('Failed to load board');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });

  return board;
}

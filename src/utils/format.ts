/**
 * Formatting utilities
 */

import chalk from 'chalk';
import { Task, Board, Column, Swimlane, TaskColor } from '../types';

export function formatTask(task: Task, detailed: boolean = false): string {
  const parts = [];

  // Task number and name
  if (task.number) {
    parts.push(chalk.gray(`#${task.number}`));
  }
  parts.push(chalk.bold(task.name));

  // Color indicator
  if (task.color) {
    parts.push(getColorBadge(task.color));
  }

  // Estimates
  if (task.pointsEstimate) {
    parts.push(chalk.cyan(`${task.pointsEstimate} pts`));
  }
  if (task.totalSecondsEstimate) {
    parts.push(chalk.cyan(formatTime(task.totalSecondsEstimate)));
  }

  // Labels
  if (task.labels && task.labels.length > 0) {
    const labels = task.labels.map(l => chalk.yellow(`[${l.name}]`)).join(' ');
    parts.push(labels);
  }

  let output = parts.join(' ');

  if (detailed) {
    const details = [];

    if (task.description) {
      details.push(`\n  ${chalk.gray('Description:')} ${task.description}`);
    }

    if (task.subTasks && task.subTasks.length > 0) {
      details.push(`\n  ${chalk.gray('Subtasks:')}`);
      task.subTasks.forEach((st, i) => {
        const status = st.finished ? chalk.green('✓') : chalk.gray('○');
        details.push(`    ${status} ${st.name}`);
      });
    }

    if (task.dates && task.dates.length > 0) {
      details.push(`\n  ${chalk.gray('Dates:')}`);
      task.dates.forEach(d => {
        details.push(`    ${d.type || 'due'}: ${d.date}`);
      });
    }

    if (task.totalSecondsSpent) {
      details.push(`\n  ${chalk.gray('Time spent:')} ${formatTime(task.totalSecondsSpent)}`);
    }

    output += details.join('');
  }

  return output;
}

export function formatBoard(board: Board): string {
  const lines = [];

  lines.push(chalk.bold.blue(`\n📋 ${board.name}`));
  lines.push(chalk.gray('─'.repeat(50)));

  lines.push(chalk.bold('\nColumns:'));
  board.columns.forEach((col, i) => {
    lines.push(`  ${i + 1}. ${col.name} ${chalk.gray(`(${col.uniqueId})`)}`);
  });

  if (board.swimlanes && board.swimlanes.length > 0) {
    lines.push(chalk.bold('\nSwimlanes:'));
    board.swimlanes.forEach((swim, i) => {
      lines.push(`  ${i + 1}. ${swim.name} ${chalk.gray(`(${swim.uniqueId})`)}`);
    });
  }

  if (board.colorTags && board.colorTags.length > 0) {
    lines.push(chalk.bold('\nColor Tags:'));
    board.colorTags.forEach(tag => {
      lines.push(`  ${getColorBadge(tag.color)} ${tag.name}`);
      if (tag.description) {
        lines.push(`     ${chalk.gray(tag.description)}`);
      }
    });
  }

  return lines.join('\n');
}

export function getColorBadge(color: TaskColor): string {
  const colors = {
    yellow: chalk.bgYellow.black(' ● '),
    white: chalk.bgWhite.black(' ● '),
    red: chalk.bgRed.white(' ● '),
    green: chalk.bgGreen.white(' ● '),
    blue: chalk.bgBlue.white(' ● '),
    purple: chalk.bgMagenta.white(' ● '),
    orange: chalk.hex('#FFA500').bgHex('#FFA500')(' ● '),
    cyan: chalk.bgCyan.black(' ● '),
    brown: chalk.hex('#8B4513').bgHex('#8B4513')(' ● '),
    magenta: chalk.bgMagenta.white(' ● '),
  };

  return colors[color] || chalk.gray(' ● ');
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatColumnWithTasks(column: Column, tasks: Task[]): string {
  const lines = [];

  lines.push(chalk.bold.blue(`\n▶ ${column.name}`));
  lines.push(chalk.gray('─'.repeat(50)));

  if (tasks.length === 0) {
    lines.push(chalk.gray('  (empty)'));
  } else {
    tasks.forEach(task => {
      lines.push(`  ${formatTask(task)}`);
    });
  }

  return lines.join('\n');
}

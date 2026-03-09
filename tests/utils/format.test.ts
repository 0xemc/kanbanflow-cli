/**
 * Tests for formatting utilities
 */

import { formatTask, formatBoard, formatTime, getColorBadge } from '../../src/utils/format';
import { Task, Board, TaskColor } from '../../src/types';

// Strip ANSI color codes for testing
const stripAnsi = (str: string): string => {
  return str.replace(/\x1B\[[0-9;]*m/g, '');
};

describe('Format Utils', () => {
  describe('formatTime', () => {
    it('should format seconds to minutes', () => {
      expect(formatTime(60)).toBe('1m');
      expect(formatTime(120)).toBe('2m');
      expect(formatTime(300)).toBe('5m');
    });

    it('should format seconds to hours and minutes', () => {
      expect(formatTime(3600)).toBe('1h 0m');
      expect(formatTime(3660)).toBe('1h 1m');
      expect(formatTime(7200)).toBe('2h 0m');
      expect(formatTime(7380)).toBe('2h 3m');
    });

    it('should handle zero', () => {
      expect(formatTime(0)).toBe('0m');
    });

    it('should handle large values', () => {
      expect(formatTime(36000)).toBe('10h 0m');
    });
  });

  describe('getColorBadge', () => {
    it('should return badge for each color', () => {
      const colors: TaskColor[] = [
        'yellow', 'white', 'red', 'green', 'blue',
        'purple', 'orange', 'cyan', 'brown', 'magenta'
      ];

      colors.forEach(color => {
        const badge = getColorBadge(color);
        expect(badge).toBeTruthy();
        expect(badge).toContain('●');
      });
    });
  });

  describe('formatTask', () => {
    const baseTask: Task = {
      _id: 'task1',
      name: 'Test Task',
      columnId: 'col1',
      position: 0,
    };

    it('should format basic task', () => {
      const output = formatTask(baseTask);
      const plain = stripAnsi(output);

      expect(plain).toContain('Test Task');
    });

    it('should include task number if present', () => {
      const task = { ...baseTask, number: 42 };
      const output = formatTask(task);
      const plain = stripAnsi(output);

      expect(plain).toContain('#42');
    });

    it('should include color indicator', () => {
      const task = { ...baseTask, color: 'green' as const };
      const output = formatTask(task);

      expect(output).toContain('●');
    });

    it('should include story points', () => {
      const task = { ...baseTask, pointsEstimate: 5 };
      const output = formatTask(task);
      const plain = stripAnsi(output);

      expect(plain).toContain('5 pts');
    });

    it('should include time estimate', () => {
      const task = { ...baseTask, totalSecondsEstimate: 7200 };
      const output = formatTask(task);
      const plain = stripAnsi(output);

      expect(plain).toContain('2h 0m');
    });

    it('should include labels', () => {
      const task = {
        ...baseTask,
        labels: [
          { name: 'Priority', pinned: true },
          { name: 'Bug', pinned: false },
        ],
      };
      const output = formatTask(task);
      const plain = stripAnsi(output);

      expect(plain).toContain('[Priority]');
      expect(plain).toContain('[Bug]');
    });

    describe('detailed mode', () => {
      it('should include description', () => {
        const task = { ...baseTask, description: 'Task description here' };
        const output = formatTask(task, true);
        const plain = stripAnsi(output);

        expect(plain).toContain('Description:');
        expect(plain).toContain('Task description here');
      });

      it('should include subtasks', () => {
        const task = {
          ...baseTask,
          subTasks: [
            { name: 'Subtask 1', finished: true },
            { name: 'Subtask 2', finished: false },
          ],
        };
        const output = formatTask(task, true);
        const plain = stripAnsi(output);

        expect(plain).toContain('Subtasks:');
        expect(plain).toContain('Subtask 1');
        expect(plain).toContain('Subtask 2');
      });

      it('should include dates', () => {
        const task = {
          ...baseTask,
          dates: [
            { date: '2026-03-15', type: 'due' as const },
          ],
        };
        const output = formatTask(task, true);
        const plain = stripAnsi(output);

        expect(plain).toContain('Dates:');
        expect(plain).toContain('2026-03-15');
      });

      it('should include time spent', () => {
        const task = { ...baseTask, totalSecondsSpent: 3600 };
        const output = formatTask(task, true);
        const plain = stripAnsi(output);

        expect(plain).toContain('Time spent:');
        expect(plain).toContain('1h 0m');
      });
    });
  });

  describe('formatBoard', () => {
    const board: Board = {
      _id: 'board1',
      name: 'Test Board',
      columns: [
        { uniqueId: 'col1', name: 'To Do', index: 0 },
        { uniqueId: 'col2', name: 'In Progress', index: 1 },
        { uniqueId: 'col3', name: 'Done', index: 2 },
      ],
    };

    it('should format board with columns', () => {
      const output = formatBoard(board);
      const plain = stripAnsi(output);

      expect(plain).toContain('Test Board');
      expect(plain).toContain('Columns:');
      expect(plain).toContain('To Do');
      expect(plain).toContain('In Progress');
      expect(plain).toContain('Done');
      expect(plain).toContain('(col1)');
      expect(plain).toContain('(col2)');
      expect(plain).toContain('(col3)');
    });

    it('should include swimlanes if present', () => {
      const boardWithSwimlanes = {
        ...board,
        swimlanes: [
          { uniqueId: 'swim1', name: 'Team A', index: 0 },
          { uniqueId: 'swim2', name: 'Team B', index: 1 },
        ],
      };

      const output = formatBoard(boardWithSwimlanes);
      const plain = stripAnsi(output);

      expect(plain).toContain('Swimlanes:');
      expect(plain).toContain('Team A');
      expect(plain).toContain('Team B');
    });

    it('should include color tags if present', () => {
      const boardWithColors = {
        ...board,
        colorTags: [
          { name: 'High Priority', color: 'red' as const, description: 'Urgent tasks' },
          { name: 'Low Priority', color: 'green' as const },
        ],
      };

      const output = formatBoard(boardWithColors);
      const plain = stripAnsi(output);

      expect(plain).toContain('Color Tags:');
      expect(plain).toContain('High Priority');
      expect(plain).toContain('Low Priority');
      expect(plain).toContain('Urgent tasks');
    });

    it('should format board without optional fields', () => {
      const minimalBoard: Board = {
        _id: 'board1',
        name: 'Minimal Board',
        columns: [
          { uniqueId: 'col1', name: 'Column 1', index: 0 },
        ],
      };

      const output = formatBoard(minimalBoard);
      const plain = stripAnsi(output);

      expect(plain).toContain('Minimal Board');
      expect(plain).not.toContain('Swimlanes:');
      expect(plain).not.toContain('Color Tags:');
    });
  });
});

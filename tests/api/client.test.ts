/**
 * Tests for KanbanFlow API Client
 */

import nock from 'nock';
import { KanbanFlowClient } from '../../src/api/client';
import { Board, Task, CreateTaskRequest } from '../../src/types';

const BASE_URL = 'https://kanbanflow.com/api/v1';
const TEST_TOKEN = 'test-api-token';

describe('KanbanFlowClient', () => {
  let client: KanbanFlowClient;

  beforeEach(() => {
    client = new KanbanFlowClient(TEST_TOKEN);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Authentication', () => {
    it('should use Basic Authentication with correct header', async () => {
      const scope = nock(BASE_URL, {
        reqheaders: {
          'authorization': (val) => {
            const expected = `Basic ${Buffer.from(`apiToken:${TEST_TOKEN}`).toString('base64')}`;
            return val === expected;
          },
        },
      })
        .get('/board')
        .reply(200, { _id: 'board1', name: 'Test Board', columns: [] });

      await client.getBoard();
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('Board Operations', () => {
    it('should fetch board structure', async () => {
      const mockBoard: Board = {
        _id: 'board1',
        name: 'Test Board',
        columns: [
          { uniqueId: 'col1', name: 'To Do', index: 0 },
          { uniqueId: 'col2', name: 'Done', index: 1 },
        ],
        swimlanes: [
          { uniqueId: 'swim1', name: 'Team A', index: 0 },
        ],
      };

      nock(BASE_URL)
        .get('/board')
        .reply(200, mockBoard);

      const board = await client.getBoard();

      expect(board).toEqual(mockBoard);
      expect(board.columns).toHaveLength(2);
      expect(board.swimlanes).toHaveLength(1);
    });
  });

  describe('Task Operations', () => {
    describe('getAllTasks', () => {
      it('should fetch all tasks grouped by column', async () => {
        const mockTasks = {
          col1: [
            { _id: 'task1', name: 'Task 1', columnId: 'col1', position: 0 },
          ],
          col2: [
            { _id: 'task2', name: 'Task 2', columnId: 'col2', position: 0 },
          ],
        };

        nock(BASE_URL)
          .get('/tasks')
          .reply(200, mockTasks);

        const tasks = await client.getAllTasks();

        expect(tasks).toEqual(mockTasks);
        expect(Object.keys(tasks)).toHaveLength(2);
      });
    });

    describe('getTasksByColumn', () => {
      it('should fetch tasks for a specific column', async () => {
        const mockTasks: Task[] = [
          { _id: 'task1', name: 'Task 1', columnId: 'col1', position: 0 },
          { _id: 'task2', name: 'Task 2', columnId: 'col1', position: 1 },
        ];

        nock(BASE_URL)
          .get('/tasks')
          .query({ columnId: 'col1' })
          .reply(200, mockTasks);

        const tasks = await client.getTasksByColumn('col1');

        expect(tasks).toEqual(mockTasks);
        expect(tasks).toHaveLength(2);
      });

      it('should apply pagination options', async () => {
        nock(BASE_URL)
          .get('/tasks')
          .query({ columnId: 'col1', limit: 50, order: 'desc' })
          .reply(200, []);

        await client.getTasksByColumn('col1', { limit: 50, order: 'desc' });
        expect(nock.isDone()).toBe(true);
      });

      it('should limit pagination to max 100', async () => {
        nock(BASE_URL)
          .get('/tasks')
          .query({ columnId: 'col1', limit: 100 })
          .reply(200, []);

        await client.getTasksByColumn('col1', { limit: 150 });
        expect(nock.isDone()).toBe(true);
      });
    });

    describe('getTask', () => {
      it('should fetch a single task', async () => {
        const mockTask: Task = {
          _id: 'task1',
          name: 'Test Task',
          columnId: 'col1',
          position: 0,
          description: 'Test description',
          color: 'green',
          pointsEstimate: 5,
        };

        nock(BASE_URL)
          .get('/tasks/task1')
          .reply(200, mockTask);

        const task = await client.getTask('task1');

        expect(task).toEqual(mockTask);
        expect(task.name).toBe('Test Task');
        expect(task.color).toBe('green');
      });

      it('should include position when requested', async () => {
        nock(BASE_URL)
          .get('/tasks/task1')
          .query({ includePosition: 'true' })
          .reply(200, { _id: 'task1', name: 'Test', columnId: 'col1', position: 0 });

        await client.getTask('task1', true);
        expect(nock.isDone()).toBe(true);
      });
    });

    describe('createTask', () => {
      it('should create a new task', async () => {
        const taskData: CreateTaskRequest = {
          name: 'New Task',
          columnId: 'col1',
          color: 'blue',
          pointsEstimate: 3,
        };

        const mockResponse = { taskId: 'task123', number: 42 };

        nock(BASE_URL)
          .post('/tasks', taskData as any)
          .reply(200, mockResponse);

        const result = await client.createTask(taskData);

        expect(result).toEqual(mockResponse);
        expect(result.taskId).toBe('task123');
        expect(result.number).toBe(42);
      });

      it('should create task with minimal data', async () => {
        const taskData: CreateTaskRequest = {
          name: 'Minimal Task',
          columnId: 'col1',
        };

        nock(BASE_URL)
          .post('/tasks', taskData as any)
          .reply(200, { taskId: 'task456' });

        const result = await client.createTask(taskData);

        expect(result.taskId).toBe('task456');
      });

      it('should create task with labels', async () => {
        const taskData: CreateTaskRequest = {
          name: 'Task with Labels',
          columnId: 'col1',
          labels: [
            { name: 'innatify', pinned: false },
            { name: 'urgent', pinned: true },
          ],
        };

        const mockResponse = { taskId: 'task789', number: 99 };

        nock(BASE_URL)
          .post('/tasks', taskData as any)
          .reply(200, mockResponse);

        const result = await client.createTask(taskData);

        expect(result.taskId).toBe('task789');
        expect(result.number).toBe(99);
      });
    });

    describe('updateTask', () => {
      it('should update task properties', async () => {
        const updates = {
          name: 'Updated Name',
          color: 'red' as const,
          pointsEstimate: 8,
        };

        nock(BASE_URL)
          .post('/tasks/task1', updates)
          .reply(200);

        await client.updateTask('task1', updates);
        expect(nock.isDone()).toBe(true);
      });

      it('should move task to different column', async () => {
        nock(BASE_URL)
          .post('/tasks/task1', { columnId: 'col2' })
          .reply(200);

        await client.updateTask('task1', { columnId: 'col2' });
        expect(nock.isDone()).toBe(true);
      });

      it('should update task with labels', async () => {
        const updates = {
          name: 'Updated Name',
          labels: [
            { name: 'urgent', pinned: false },
            { name: 'bug', pinned: true },
          ],
        };

        nock(BASE_URL)
          .post('/tasks/task1', updates)
          .reply(200);

        await client.updateTask('task1', updates);
        expect(nock.isDone()).toBe(true);
      });
    });
  });

  describe('Subtask Operations', () => {
    it('should add a subtask', async () => {
      const subtask = {
        name: 'New Subtask',
        finished: false,
      };

      const mockResponse = { insertIndex: 0 };

      nock(BASE_URL)
        .post('/tasks/task1/subtasks', subtask)
        .reply(200, mockResponse);

      const result = await client.addSubtask('task1', subtask);

      expect(result).toEqual(mockResponse);
      expect(result.insertIndex).toBe(0);
    });

    it('should add subtask at specific index', async () => {
      const subtask = {
        name: 'New Subtask',
        finished: false,
      };

      nock(BASE_URL)
        .post('/tasks/task1/subtasks')
        .query({ insertIndex: 2 })
        .reply(200, { insertIndex: 2 });

      const result = await client.addSubtask('task1', subtask, 2);

      expect(result.insertIndex).toBe(2);
    });

    it('should update a subtask', async () => {
      const updates = { finished: true };

      nock(BASE_URL)
        .post('/tasks/task1/subtasks/by-index/0', updates)
        .reply(200);

      await client.updateSubtask('task1', 0, updates);
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('Label Operations', () => {
    it('should add a label', async () => {
      const label = {
        name: 'Priority',
        pinned: true,
      };

      nock(BASE_URL)
        .post('/tasks/task1/labels', label)
        .reply(200, { insertIndex: 0 });

      const result = await client.addLabel('task1', label);

      expect(result.insertIndex).toBe(0);
    });

    it('should update a label', async () => {
      const updates = { pinned: false };

      nock(BASE_URL)
        .post('/tasks/task1/labels/by-name/Priority', updates)
        .reply(200);

      await client.updateLabel('task1', 'Priority', updates);
      expect(nock.isDone()).toBe(true);
    });

    it('should encode label name in URL', async () => {
      nock(BASE_URL)
        .post('/tasks/task1/labels/by-name/High%20Priority', {})
        .reply(200);

      await client.updateLabel('task1', 'High Priority', {});
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('Comment Operations', () => {
    it('should add a comment', async () => {
      nock(BASE_URL)
        .post('/tasks/task1/comments', { text: 'Great work!' })
        .reply(200);

      await client.addComment('task1', 'Great work!');
      expect(nock.isDone()).toBe(true);
    });

    it('should update a comment', async () => {
      nock(BASE_URL)
        .post('/tasks/task1/comments/comment123', { text: 'Updated comment' })
        .reply(200);

      await client.updateComment('task1', 'comment123', 'Updated comment');
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('User Operations', () => {
    it('should fetch users list', async () => {
      const mockUsers = [
        { userId: 'user1', fullName: 'John Doe', email: 'john@example.com' },
        { userId: 'user2', fullName: 'Jane Smith', email: 'jane@example.com' },
      ];

      nock(BASE_URL)
        .get('/users')
        .query({ apiToken: TEST_TOKEN })
        .reply(200, mockUsers);

      const users = await client.getUsers();

      expect(users).toEqual(mockUsers);
      expect(users).toHaveLength(2);
    });
  });

  describe('Webhook Operations', () => {
    it('should create a webhook', async () => {
      const webhookData = {
        callbackUrl: 'https://example.com/webhook',
        events: ['taskCreated', 'taskChanged'] as const,
      };

      const mockResponse = {
        _id: 'webhook123',
        ...webhookData,
        secret: 'secret123',
      };

      nock(BASE_URL)
        .post('/webhooks', webhookData)
        .reply(200, mockResponse);

      const webhook = await client.createWebhook(
        webhookData.callbackUrl,
        [...webhookData.events]
      );

      expect(webhook._id).toBe('webhook123');
      expect(webhook.secret).toBe('secret123');
    });

    it('should create webhook with filter', async () => {
      const filter = { columnId: 'col1', swimlaneId: 'swim1' };

      nock(BASE_URL)
        .post('/webhooks', {
          callbackUrl: 'https://example.com/webhook',
          events: ['taskCreated'],
          filter,
        })
        .reply(200, { _id: 'webhook123', secret: 'secret123' });

      await client.createWebhook('https://example.com/webhook', ['taskCreated'], filter);
      expect(nock.isDone()).toBe(true);
    });

    it('should delete a webhook', async () => {
      nock(BASE_URL)
        .post('/webhooks/webhook123')
        .reply(200);

      await client.deleteWebhook('webhook123');
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw error on API failure', async () => {
      nock(BASE_URL)
        .get('/board')
        .reply(500, { error: 'Internal Server Error' });

      await expect(client.getBoard()).rejects.toThrow();
    });

    it('should throw error on authentication failure', async () => {
      nock(BASE_URL)
        .get('/tasks')
        .reply(401, { error: 'Unauthorized' });

      await expect(client.getAllTasks()).rejects.toThrow();
    });

    it('should throw error on not found', async () => {
      nock(BASE_URL)
        .get('/tasks/invalid-id')
        .reply(404, { error: 'Task not found' });

      await expect(client.getTask('invalid-id')).rejects.toThrow();
    });
  });
});

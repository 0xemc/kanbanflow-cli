/**
 * Integration tests for CLI commands
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import nock from 'nock';
import { KanbanFlowClient } from '../../src/api/client';

const BASE_URL = 'https://kanbanflow.com/api/v1';
const CONFIG_DIR = path.join(os.homedir(), '.kanbanflow-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

describe('CLI Integration Tests', () => {
  beforeEach(() => {
    nock.cleanAll();
    // Clean up config
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  });

  afterEach(() => {
    nock.cleanAll();
    // Clean up config
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        fs.unlinkSync(CONFIG_FILE);
      }
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('End-to-end workflow', () => {
    it('should complete full task creation workflow', async () => {
      const client = new KanbanFlowClient('test-token');

      // 1. Get board structure
      const mockBoard = {
        _id: 'board1',
        name: 'My Board',
        columns: [
          { uniqueId: 'col-todo', name: 'To Do', index: 0 },
          { uniqueId: 'col-done', name: 'Done', index: 1 },
        ],
      };

      nock(BASE_URL)
        .get('/board')
        .reply(200, mockBoard);

      const board = await client.getBoard();
      expect(board.columns).toHaveLength(2);

      // 2. Create a task
      const taskData = {
        name: 'New Feature',
        columnId: 'col-todo',
        color: 'green' as const,
        pointsEstimate: 5,
      };

      nock(BASE_URL)
        .post('/tasks', taskData)
        .reply(200, { taskId: 'task-new', number: 1 });

      const createResult = await client.createTask(taskData);
      expect(createResult.taskId).toBe('task-new');

      // 3. Get task details
      const mockTask = {
        _id: 'task-new',
        name: 'New Feature',
        columnId: 'col-todo',
        color: 'green',
        pointsEstimate: 5,
        position: 0,
      };

      nock(BASE_URL)
        .get('/tasks/task-new')
        .reply(200, mockTask);

      const task = await client.getTask('task-new');
      expect(task.name).toBe('New Feature');

      // 4. Add subtask
      nock(BASE_URL)
        .post('/tasks/task-new/subtasks', { name: 'Step 1', finished: false })
        .reply(200, { insertIndex: 0 });

      const subtaskResult = await client.addSubtask('task-new', {
        name: 'Step 1',
        finished: false,
      });
      expect(subtaskResult.insertIndex).toBe(0);

      // 5. Update task to move to Done
      nock(BASE_URL)
        .post('/tasks/task-new', { columnId: 'col-done' })
        .reply(200);

      await client.updateTask('task-new', { columnId: 'col-done' });
    });

    it('should handle task with labels and comments', async () => {
      const client = new KanbanFlowClient('test-token');

      // Create task
      nock(BASE_URL)
        .post('/tasks', { name: 'Labeled Task', columnId: 'col1' })
        .reply(200, { taskId: 'task-labeled' });

      const createResult = await client.createTask({
        name: 'Labeled Task',
        columnId: 'col1',
      });

      // Add label
      nock(BASE_URL)
        .post('/tasks/task-labeled/labels', { name: 'Bug', pinned: true })
        .reply(200, { insertIndex: 0 });

      await client.addLabel('task-labeled', { name: 'Bug', pinned: true });

      // Add comment
      nock(BASE_URL)
        .post('/tasks/task-labeled/comments', { text: 'Working on this' })
        .reply(200);

      await client.addComment('task-labeled', 'Working on this');

      expect(createResult.taskId).toBe('task-labeled');
    });

    it('should create task with labels in one call', async () => {
      const client = new KanbanFlowClient('test-token');

      const taskData = {
        name: 'Task with Labels',
        columnId: 'col1',
        labels: [
          { name: 'innatify', pinned: false },
          { name: 'urgent', pinned: true },
        ],
        totalSecondsEstimate: 1800,
      };

      nock(BASE_URL)
        .post('/tasks', taskData)
        .reply(200, { taskId: 'task-with-labels', number: 10 });

      const result = await client.createTask(taskData);

      expect(result.taskId).toBe('task-with-labels');
      expect(result.number).toBe(10);
    });

    it('should update task labels', async () => {
      const client = new KanbanFlowClient('test-token');

      const updates = {
        labels: [
          { name: 'updated-label', pinned: false },
          { name: 'another-label', pinned: true },
        ],
      };

      nock(BASE_URL)
        .post('/tasks/task-update', updates)
        .reply(200);

      await client.updateTask('task-update', updates);
      expect(nock.isDone()).toBe(true);
    });

    it('should retrieve and filter tasks by column', async () => {
      const client = new KanbanFlowClient('test-token');

      const mockTasks = [
        { _id: 'task1', name: 'Task 1', columnId: 'col1', position: 0 },
        { _id: 'task2', name: 'Task 2', columnId: 'col1', position: 1 },
        { _id: 'task3', name: 'Task 3', columnId: 'col1', position: 2 },
      ];

      nock(BASE_URL)
        .get('/tasks')
        .query({ columnId: 'col1', limit: 50 })
        .reply(200, mockTasks);

      const tasks = await client.getTasksByColumn('col1', { limit: 50 });

      expect(tasks).toHaveLength(3);
      expect(tasks[0].name).toBe('Task 1');
      expect(tasks[2].name).toBe('Task 3');
    });
  });

  describe('Error scenarios', () => {
    it('should handle network errors gracefully', async () => {
      const client = new KanbanFlowClient('test-token');

      nock(BASE_URL)
        .get('/board')
        .replyWithError('Network error');

      await expect(client.getBoard()).rejects.toThrow('Network error');
    });

    it('should handle invalid task ID', async () => {
      const client = new KanbanFlowClient('test-token');

      nock(BASE_URL)
        .get('/tasks/invalid')
        .reply(404, { error: 'Task not found' });

      await expect(client.getTask('invalid')).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const client = new KanbanFlowClient('invalid-token');

      nock(BASE_URL)
        .get('/board')
        .reply(401, { error: 'Invalid API token' });

      await expect(client.getBoard()).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      const client = new KanbanFlowClient('test-token');

      nock(BASE_URL)
        .post('/tasks', { name: '' })
        .reply(400, { error: 'Task name is required' });

      await expect(client.createTask({ name: '', columnId: 'col1' })).rejects.toThrow();
    });
  });

  describe('Pagination', () => {
    it('should handle paginated task results', async () => {
      const client = new KanbanFlowClient('test-token');

      // First page
      const page1 = Array.from({ length: 100 }, (_, i) => ({
        _id: `task${i}`,
        name: `Task ${i}`,
        columnId: 'col1',
        position: i,
      }));

      nock(BASE_URL)
        .get('/tasks')
        .query({ columnId: 'col1', limit: 100 })
        .reply(200, page1);

      const tasks = await client.getTasksByColumn('col1', { limit: 100 });

      expect(tasks).toHaveLength(100);
      expect(tasks[0]._id).toBe('task0');
      expect(tasks[99]._id).toBe('task99');
    });

    it('should respect pagination limit', async () => {
      const client = new KanbanFlowClient('test-token');

      nock(BASE_URL)
        .get('/tasks')
        .query({ columnId: 'col1', limit: 25 })
        .reply(200, []);

      await client.getTasksByColumn('col1', { limit: 25 });
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('Webhook integration', () => {
    it('should set up and tear down webhooks', async () => {
      const client = new KanbanFlowClient('test-token');

      // Create webhook
      const webhookData = {
        callbackUrl: 'https://example.com/webhook',
        events: ['taskCreated', 'taskChanged'] as const,
      };

      nock(BASE_URL)
        .post('/webhooks', webhookData)
        .reply(200, {
          _id: 'webhook123',
          ...webhookData,
          secret: 'secret123',
        });

      const webhook = await client.createWebhook(
        webhookData.callbackUrl,
        [...webhookData.events]
      );

      expect(webhook._id).toBe('webhook123');
      expect(webhook.secret).toBe('secret123');

      // Delete webhook
      nock(BASE_URL)
        .post('/webhooks/webhook123')
        .reply(200);

      await client.deleteWebhook('webhook123');
      expect(nock.isDone()).toBe(true);
    });
  });
});

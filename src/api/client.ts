/**
 * KanbanFlow API Client
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  Board,
  Task,
  CreateTaskRequest,
  SubTask,
  Label,
  Comment,
  User,
  Webhook,
  WebhookEvent,
} from '../types';

export class KanbanFlowClient {
  private client: AxiosInstance;
  private apiToken: string;

  constructor(apiToken: string, baseUrl: string = 'https://kanbanflow.com/api/v1') {
    this.apiToken = apiToken;

    // Create axios instance with Basic Authentication
    const auth = Buffer.from(`apiToken:${apiToken}`).toString('base64');

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Board Operations
  async getBoard(): Promise<Board> {
    const { data } = await this.client.get<Board>('/board');
    return data;
  }

  // Task Operations
  async getAllTasks(): Promise<Record<string, Task[]>> {
    const { data } = await this.client.get<Record<string, Task[]>>('/tasks');
    return data;
  }

  async getTasksByColumn(
    columnId: string,
    options?: {
      startTaskId?: string;
      limit?: number;
      order?: 'asc' | 'desc';
    }
  ): Promise<Task[]> {
    const params: any = { columnId };
    if (options?.startTaskId) params.startTaskId = options.startTaskId;
    if (options?.limit) params.limit = Math.min(options.limit, 100);
    if (options?.order) params.order = options.order;

    const { data } = await this.client.get<Task[]>('/tasks', { params });
    return data;
  }

  async getTasksBySwimlaneAndColumn(
    swimlaneId: string,
    columnId: string,
    options?: {
      startTaskId?: string;
      limit?: number;
      order?: 'asc' | 'desc';
    }
  ): Promise<Task[]> {
    const params: any = { swimlaneId, columnId };
    if (options?.startTaskId) params.startTaskId = options.startTaskId;
    if (options?.limit) params.limit = Math.min(options.limit, 100);
    if (options?.order) params.order = options.order;

    const { data} = await this.client.get<Task[]>('/tasks', { params });
    return data;
  }

  async getTask(taskId: string, includePosition: boolean = false): Promise<Task> {
    const params = includePosition ? { includePosition: 'true' } : {};
    const { data } = await this.client.get<Task>(`/tasks/${taskId}`, { params });
    return data;
  }

  async createTask(task: CreateTaskRequest): Promise<{ taskId: string; number?: number }> {
    const { data } = await this.client.post('/tasks', task);
    return data;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    await this.client.post(`/tasks/${taskId}`, updates);
  }

  async deleteTask(taskId: string): Promise<void> {
    // Note: Delete endpoint not explicitly documented, may need to check API docs
    await this.client.delete(`/tasks/${taskId}`);
  }

  // Subtask Operations
  async addSubtask(
    taskId: string,
    subtask: SubTask,
    insertIndex?: number
  ): Promise<{ insertIndex: number }> {
    const params = insertIndex !== undefined ? { insertIndex } : {};
    const { data } = await this.client.post(`/tasks/${taskId}/subtasks`, subtask, { params });
    return data;
  }

  async updateSubtask(taskId: string, index: number, subtask: Partial<SubTask>): Promise<void> {
    await this.client.post(`/tasks/${taskId}/subtasks/by-index/${index}`, subtask);
  }

  // Label Operations
  async addLabel(
    taskId: string,
    label: Label,
    insertIndex?: number
  ): Promise<{ insertIndex: number }> {
    const params = insertIndex !== undefined ? { insertIndex } : {};
    const { data } = await this.client.post(`/tasks/${taskId}/labels`, label, { params });
    return data;
  }

  async updateLabel(taskId: string, labelName: string, updates: Partial<Label>): Promise<void> {
    await this.client.post(`/tasks/${taskId}/labels/by-name/${encodeURIComponent(labelName)}`, updates);
  }

  // Date Operations
  async setTaskDate(taskId: string, date: { date: string; type?: 'start' | 'due' }): Promise<void> {
    await this.client.post(`/tasks/${taskId}/dates`, date);
  }

  // Comment Operations
  async addComment(taskId: string, text: string): Promise<void> {
    await this.client.post(`/tasks/${taskId}/comments`, { text });
  }

  async updateComment(taskId: string, commentId: string, text: string): Promise<void> {
    await this.client.post(`/tasks/${taskId}/comments/${commentId}`, { text });
  }

  // Custom Field Operations
  async updateCustomField(taskId: string, fieldId: string, value: any): Promise<void> {
    await this.client.post(`/tasks/${taskId}/custom-fields/${fieldId}`, { value });
  }

  // User Operations
  async getUsers(): Promise<User[]> {
    const { data } = await this.client.get<User[]>('/users', {
      params: { apiToken: this.apiToken },
    });
    return data;
  }

  // Webhook Operations
  async createWebhook(
    callbackUrl: string,
    events: WebhookEvent[],
    filter?: { columnId?: string; swimlaneId?: string }
  ): Promise<Webhook> {
    const payload: any = { callbackUrl, events };
    if (filter) payload.filter = filter;

    const { data } = await this.client.post<Webhook>('/webhooks', payload);
    return data;
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    // Note: Uses POST instead of DELETE (as per API documentation)
    await this.client.post(`/webhooks/${webhookId}`);
  }
}

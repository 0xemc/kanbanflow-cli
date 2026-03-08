/**
 * KanbanFlow API Types
 */

export type TaskColor =
  | 'yellow'
  | 'white'
  | 'red'
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'cyan'
  | 'brown'
  | 'magenta';

export type TaskPosition = 'top' | 'bottom' | number;

export interface Board {
  _id: string;
  name: string;
  columns: Column[];
  swimlanes?: Swimlane[];
  colorTags?: ColorTag[];
}

export interface Column {
  uniqueId: string;
  name: string;
  index: number;
}

export interface Swimlane {
  uniqueId: string;
  name: string;
  index: number;
}

export interface ColorTag {
  name: string;
  color: TaskColor;
  description?: string;
}

export interface Task {
  _id: string;
  name: string;
  description?: string;
  color?: TaskColor;
  columnId: string;
  swimlaneId?: string;
  position: number;
  number?: number;
  responsibleUserId?: string;
  totalSecondsEstimate?: number;
  pointsEstimate?: number;
  totalSecondsSpent?: number;
  dates?: TaskDate[];
  subTasks?: SubTask[];
  labels?: Label[];
  collaborators?: string[];
  customFields?: Record<string, any>;
  groupingDate?: string;
}

export interface CreateTaskRequest {
  name: string;
  columnId?: string;
  columnIndex?: number;
  swimlaneId?: string;
  color?: TaskColor;
  description?: string;
  position?: TaskPosition;
  responsibleUserId?: string;
  totalSecondsEstimate?: number;
  pointsEstimate?: number;
  groupingDate?: string;
  dates?: TaskDate[];
  subTasks?: SubTask[];
  labels?: Label[];
  collaborators?: string[];
}

export interface TaskDate {
  date: string; // YYYY-MM-DD
  type?: 'start' | 'due';
}

export interface SubTask {
  name: string;
  finished: boolean;
  userId?: string;
  dueDateTimestamp?: string;
  dueDateTimestampLocal?: string;
}

export interface Label {
  name: string;
  pinned?: boolean;
}

export interface Comment {
  _id: string;
  text: string;
  userId: string;
  userFullName: string;
  timestamp: string;
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
}

export interface Webhook {
  _id: string;
  callbackUrl: string;
  events: WebhookEvent[];
  secret: string;
  filter?: {
    columnId?: string;
    swimlaneId?: string;
  };
}

export type WebhookEvent =
  | 'taskCreated'
  | 'taskChanged'
  | 'taskDeleted'
  | 'taskCommentCreated'
  | 'taskCommentChanged'
  | 'taskCommentDeleted';

export interface KanbanFlowConfig {
  apiToken: string;
  baseUrl?: string;
}

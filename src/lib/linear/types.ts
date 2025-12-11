/**
 * Типы для работы с Linear API
 */

export interface LinearIssue {
  id: string;
  identifier: string; // Например: "EDU-123"
  title: string;
  description?: string;
  state: {
    id: string;
    name: string;
    type: string; // "started", "completed", etc.
  };
  priority: number;
  labels?: {
    nodes: Array<{
      id: string;
      name: string;
    }>;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinearIssueInput {
  title: string;
  description?: string;
  teamId: string;
  stateId?: string;
  assigneeId?: string;
  priority?: number;
  labelIds?: string[];
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string; // Префикс для идентификаторов (например: "EDU")
}


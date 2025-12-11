import { getLinearClient } from './client';
import type { LinearIssue, LinearIssueInput } from './types';

/**
 * Получить все задачи из Linear
 */
export async function getAllIssues(teamId?: string): Promise<LinearIssue[]> {
  const client = getLinearClient();
  
  const issues = await client.issues({
    filter: teamId
      ? {
          team: {
            id: {
              eq: teamId,
            },
          },
        }
      : undefined,
    first: 50, // Максимум за раз
  });

  const nodes = issues.nodes || [];
  
  return nodes.map((issue) => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description || undefined,
    state: {
      id: issue.state.id,
      name: issue.state.name,
      type: issue.state.type,
    },
    priority: issue.priority || 0,
    labels: issue.labels
      ? {
          nodes: issue.labels.nodes.map((label) => ({
            id: label.id,
            name: label.name,
          })),
        }
      : undefined,
    assignee: issue.assignee
      ? {
          id: issue.assignee.id,
          name: issue.assignee.name,
          email: issue.assignee.email,
        }
      : undefined,
    url: issue.url,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
  }));
}

/**
 * Получить задачи в статусе "In Progress" (для работы)
 */
export async function getInProgressIssues(teamId?: string): Promise<LinearIssue[]> {
  const client = getLinearClient();
  
  const issues = await client.issues({
    filter: {
      ...(teamId ? { team: { id: { eq: teamId } } } : {}),
      state: {
        type: {
          eq: 'started',
        },
      },
    },
    first: 50,
  });

  const nodes = issues.nodes || [];
  
  return nodes.map((issue) => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description || undefined,
    state: {
      id: issue.state.id,
      name: issue.state.name,
      type: issue.state.type,
    },
    priority: issue.priority || 0,
    labels: issue.labels
      ? {
          nodes: issue.labels.nodes.map((label) => ({
            id: label.id,
            name: label.name,
          })),
        }
      : undefined,
    assignee: issue.assignee
      ? {
          id: issue.assignee.id,
          name: issue.assignee.name,
          email: issue.assignee.email,
        }
      : undefined,
    url: issue.url,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
  }));
}

/**
 * Получить задачи в статусе "Todo" (готовы к работе)
 */
export async function getTodoIssues(teamId?: string): Promise<LinearIssue[]> {
  const client = getLinearClient();
  
  const issues = await client.issues({
    filter: {
      ...(teamId ? { team: { id: { eq: teamId } } } : {}),
      state: {
        type: {
          eq: 'unstarted',
        },
      },
    },
    first: 50,
  });

  const nodes = issues.nodes || [];
  
  return nodes.map((issue) => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description || undefined,
    state: {
      id: issue.state.id,
      name: issue.state.name,
      type: issue.state.type,
    },
    priority: issue.priority || 0,
    labels: issue.labels
      ? {
          nodes: issue.labels.nodes.map((label) => ({
            id: label.id,
            name: label.name,
          })),
        }
      : undefined,
    assignee: issue.assignee
      ? {
          id: issue.assignee.id,
          name: issue.assignee.name,
          email: issue.assignee.email,
        }
      : undefined,
    url: issue.url,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
  }));
}

/**
 * Создать новую задачу в Linear
 */
export async function createIssue(input: LinearIssueInput): Promise<LinearIssue> {
  const client = getLinearClient();
  
  const issuePayload: any = {
    teamId: input.teamId,
    title: input.title,
  };

  if (input.description) {
    issuePayload.description = input.description;
  }

  if (input.stateId) {
    issuePayload.stateId = input.stateId;
  }

  if (input.assigneeId) {
    issuePayload.assigneeId = input.assigneeId;
  }

  if (input.priority !== undefined) {
    issuePayload.priority = input.priority;
  }

  if (input.labelIds && input.labelIds.length > 0) {
    issuePayload.labelIds = input.labelIds;
  }

  const issue = await client.createIssue(issuePayload);
  
  if (!issue) {
    throw new Error('Не удалось создать задачу в Linear');
  }

  const createdIssue = await client.issue(issue.id);
  
  if (!createdIssue) {
    throw new Error('Не удалось получить созданную задачу');
  }

  return {
    id: createdIssue.id,
    identifier: createdIssue.identifier,
    title: createdIssue.title,
    description: createdIssue.description || undefined,
    state: {
      id: createdIssue.state.id,
      name: createdIssue.state.name,
      type: createdIssue.state.type,
    },
    priority: createdIssue.priority || 0,
    labels: createdIssue.labels
      ? {
          nodes: createdIssue.labels.nodes.map((label) => ({
            id: label.id,
            name: label.name,
          })),
        }
      : undefined,
    assignee: createdIssue.assignee
      ? {
          id: createdIssue.assignee.id,
          name: createdIssue.assignee.name,
          email: createdIssue.assignee.email,
        }
      : undefined,
    url: createdIssue.url,
    createdAt: createdIssue.createdAt.toISOString(),
    updatedAt: createdIssue.updatedAt.toISOString(),
  };
}

/**
 * Обновить задачу в Linear
 */
export async function updateIssue(
  issueId: string,
  updates: {
    title?: string;
    description?: string;
    stateId?: string;
    assigneeId?: string;
    priority?: number;
  }
): Promise<LinearIssue> {
  const client = getLinearClient();
  
  const issue = await client.updateIssue(issueId, updates);
  
  if (!issue) {
    throw new Error('Не удалось обновить задачу в Linear');
  }

  const updatedIssue = await client.issue(issue.id);
  
  if (!updatedIssue) {
    throw new Error('Не удалось получить обновленную задачу');
  }

  return {
    id: updatedIssue.id,
    identifier: updatedIssue.identifier,
    title: updatedIssue.title,
    description: updatedIssue.description || undefined,
    state: {
      id: updatedIssue.state.id,
      name: updatedIssue.state.name,
      type: updatedIssue.state.type,
    },
    priority: updatedIssue.priority || 0,
    labels: updatedIssue.labels
      ? {
          nodes: updatedIssue.labels.nodes.map((label) => ({
            id: label.id,
            name: label.name,
          })),
        }
      : undefined,
    assignee: updatedIssue.assignee
      ? {
          id: updatedIssue.assignee.id,
          name: updatedIssue.assignee.name,
          email: updatedIssue.assignee.email,
        }
      : undefined,
    url: updatedIssue.url,
    createdAt: updatedIssue.createdAt.toISOString(),
    updatedAt: updatedIssue.updatedAt.toISOString(),
  };
}

/**
 * Получить список команд (teams) в Linear
 */
export async function getTeams() {
  const client = getLinearClient();
  const teams = await client.teams();
  
  return teams.nodes.map((team) => ({
    id: team.id,
    name: team.name,
    key: team.key,
  }));
}


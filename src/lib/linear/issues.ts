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
  
  const result: LinearIssue[] = [];
  
  for (const issue of nodes) {
    const state = await issue.state;
    if (!state) continue;
    
    // Резолвим assignee если есть
    const assigneeData = issue.assignee ? await issue.assignee : null;
    
    result.push({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || undefined,
      state: {
        id: state.id,
        name: state.name,
        type: state.type,
      },
      priority: issue.priority || 0,
      labels: undefined, // Labels не критично для базовой работы, пропускаем
      assignee: assigneeData
        ? {
            id: assigneeData.id,
            name: assigneeData.name,
            email: assigneeData.email,
          }
        : undefined,
      url: issue.url,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
    });
  }
  
  return result;
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
  
  const result: LinearIssue[] = [];
  
  for (const issue of nodes) {
    const state = await issue.state;
    if (!state) continue;
    
    // Резолвим assignee если есть
    const assigneeData = issue.assignee ? await issue.assignee : null;
    
    result.push({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || undefined,
      state: {
        id: state.id,
        name: state.name,
        type: state.type,
      },
      priority: issue.priority || 0,
      labels: undefined, // Labels не критично для базовой работы, пропускаем
      assignee: assigneeData
        ? {
            id: assigneeData.id,
            name: assigneeData.name,
            email: assigneeData.email,
          }
        : undefined,
      url: issue.url,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
    });
  }
  
  return result;
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
  
  const result: LinearIssue[] = [];
  
  for (const issue of nodes) {
    const state = await issue.state;
    if (!state) continue;
    
    // Резолвим assignee если есть
    const assigneeData = issue.assignee ? await issue.assignee : null;
    
    result.push({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || undefined,
      state: {
        id: state.id,
        name: state.name,
        type: state.type,
      },
      priority: issue.priority || 0,
      labels: undefined, // Labels не критично для базовой работы, пропускаем
      assignee: assigneeData
        ? {
            id: assigneeData.id,
            name: assigneeData.name,
            email: assigneeData.email,
          }
        : undefined,
      url: issue.url,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
    });
  }
  
  return result;
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

  const issueResult = await client.createIssue(issuePayload);
  
  if (!issueResult) {
    throw new Error('Не удалось создать задачу в Linear');
  }

  // createIssue возвращает IssuePayload, нужно получить Issue отдельно
  // Попробуем получить ID из результата или использовать другой подход
  // Временно используем type assertion
  const createdIssueId = (issueResult as any).id || (issueResult as any).issue?.id;
  if (!createdIssueId) {
    // Если нет ID, попробуем получить через последнюю задачу команды
    const teamIssues = await client.issues({
      filter: { team: { id: { eq: input.teamId } } },
      first: 1,
    });
    const latestIssue = teamIssues.nodes?.[0];
    if (!latestIssue) {
      throw new Error('Не удалось получить ID созданной задачи');
    }
    const createdIssue = await client.issue(latestIssue.id);
    if (!createdIssue) {
      throw new Error('Не удалось получить созданную задачу');
    }
    const state = await createdIssue.state;
    if (!state) {
      throw new Error('У созданной задачи отсутствует state');
    }
    const assigneeData = createdIssue.assignee ? await createdIssue.assignee : null;
    return {
      id: createdIssue.id,
      identifier: createdIssue.identifier,
      title: createdIssue.title,
      description: createdIssue.description || undefined,
      state: {
        id: state.id,
        name: state.name,
        type: state.type,
      },
      priority: createdIssue.priority || 0,
      labels: undefined,
      assignee: assigneeData
        ? {
            id: assigneeData.id,
            name: assigneeData.name,
            email: assigneeData.email,
          }
        : undefined,
      url: createdIssue.url,
      createdAt: createdIssue.createdAt.toISOString(),
      updatedAt: createdIssue.updatedAt.toISOString(),
    };
  }

  const createdIssue = await client.issue(createdIssueId);
  
  if (!createdIssue) {
    throw new Error('Не удалось получить созданную задачу');
  }

  const state = await createdIssue.state;
  if (!state) {
    throw new Error('У созданной задачи отсутствует state');
  }

  const assigneeData = createdIssue.assignee ? await createdIssue.assignee : null;

  return {
    id: createdIssue.id,
    identifier: createdIssue.identifier,
    title: createdIssue.title,
    description: createdIssue.description || undefined,
    state: {
      id: state.id,
      name: state.name,
      type: state.type,
    },
    priority: createdIssue.priority || 0,
    labels: undefined, // Labels пропускаем для упрощения
    assignee: assigneeData
      ? {
          id: assigneeData.id,
          name: assigneeData.name,
          email: assigneeData.email,
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
  
  const issueResult = await client.updateIssue(issueId, updates);
  
  if (!issueResult) {
    throw new Error('Не удалось обновить задачу в Linear');
  }

  // Используем issueId из параметров, так как updateIssue возвращает IssuePayload
  const updatedIssue = await client.issue(issueId);
  
  if (!updatedIssue) {
    throw new Error('Не удалось получить обновленную задачу');
  }

  const state = await updatedIssue.state;
  if (!state) {
    throw new Error('У обновленной задачи отсутствует state');
  }

  const assigneeData = updatedIssue.assignee ? await updatedIssue.assignee : null;

  return {
    id: updatedIssue.id,
    identifier: updatedIssue.identifier,
    title: updatedIssue.title,
    description: updatedIssue.description || undefined,
    state: {
      id: state.id,
      name: state.name,
      type: state.type,
    },
    priority: updatedIssue.priority || 0,
    labels: undefined, // Labels пропускаем для упрощения
    assignee: assigneeData
      ? {
          id: assigneeData.id,
          name: assigneeData.name,
          email: assigneeData.email,
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


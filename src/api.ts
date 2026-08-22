import { getPreferenceValues } from "@raycast/api";

export type WorkspaceContext = "work" | "private";

export type TodoStatus = "NEW" | "FOCUS" | "IN_PROGRESS" | "DONE";

export type TodoDto = {
  id: string;
  context: WorkspaceContext;
  projectId: string | null;
  projectName: string | null;
  defaultCostCenterId: string | null;
  defaultCostCenterName: string | null;
  title: string;
  description: string | null;
  summary: string | null;
  status: TodoStatus;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTodoDto = {
  title: string;
  context: WorkspaceContext;
  description?: string | null;
};

export type UpdateTodoDto = {
  title?: string;
  description?: string | null;
  summary?: string | null;
  status?: TodoStatus;
  nextReviewAt?: string | null;
  projectId?: string | null;
  defaultCostCenterId?: string | null;
};

export type CompanionActiveTimerDto = {
  todo: TodoDto;
};

export type CompanionSnapshotDto = {
  recentTodos: TodoDto[];
  activeTimers: CompanionActiveTimerDto[];
};

export function getApiConfig() {
  const { apiToken, apiBaseUrl } = getPreferenceValues<Preferences>();

  return {
    baseUrl: apiBaseUrl.replace(/\/+$/, ""),
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
    },
  };
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { baseUrl, headers } = getApiConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...headers,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}${body ? `: ${body}` : ""}`);
  }

  return (await response.json()) as T;
}

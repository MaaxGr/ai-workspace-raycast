import { LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { WorkspaceContext } from "./api";

const WORKSPACE_CONTEXT_KEY = "workspaceContext";

function isWorkspaceContext(value: unknown): value is WorkspaceContext {
  return value === "work" || value === "private";
}

export function formatContextLabel(context: WorkspaceContext): string {
  return context === "work" ? "Work" : "Private";
}

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  const stored = await LocalStorage.getItem(WORKSPACE_CONTEXT_KEY);
  return isWorkspaceContext(stored) ? stored : "work";
}

export async function toggleWorkspaceContext(): Promise<WorkspaceContext> {
  const next: WorkspaceContext = (await getWorkspaceContext()) === "work" ? "private" : "work";
  await LocalStorage.setItem(WORKSPACE_CONTEXT_KEY, next);
  return next;
}

export function useWorkspaceContext() {
  const [context, setContext] = useState<WorkspaceContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    getWorkspaceContext().then((value) => {
      if (!cancelled) {
        setContext(value);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return context;
}

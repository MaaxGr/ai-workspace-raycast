import { Action, ActionPanel, Detail, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { createElement, useState } from "react";
import { apiRequest, CompanionSnapshotDto, getApiConfig, TodoDto, TodoStatus, UpdateTodoDto } from "./api";
import { formatContextLabel, useWorkspaceContext } from "./context";

const STATUSES: TodoStatus[] = ["NEW", "FOCUS", "IN_PROGRESS", "DONE"];

const STATUS_LABELS: Record<TodoStatus, string> = {
  NEW: "New",
  FOCUS: "Focus",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

function isTodoStatus(value: unknown): value is TodoStatus {
  return STATUSES.includes(value as TodoStatus);
}

function resolveCompanionTodo(snapshot: CompanionSnapshotDto): TodoDto | undefined {
  return snapshot.activeTimers[0]?.todo ?? snapshot.recentTodos[0];
}

function EditCompanionForm({ todo, contextLabel }: { todo: TodoDto; contextLabel: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: Form.Values) {
    const title = String(values.title ?? "").trim();
    if (!title) {
      await showToast({ style: Toast.Style.Failure, title: "Title is required" });
      return;
    }

    if (!isTodoStatus(values.status)) {
      await showToast({ style: Toast.Style.Failure, title: "Status is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      const description = String(values.description ?? "").trim();
      const body: UpdateTodoDto = {
        title,
        description: description ? description : null,
        status: values.status,
      };
      const updated = await apiRequest<TodoDto>(`/todos/${encodeURIComponent(todo.id)}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      await showToast({ style: Toast.Style.Success, title: `Updated "${updated.title}"` });
      await popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to update todo",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return createElement(
    Form,
    {
      isLoading: isSubmitting,
      actions: createElement(
        ActionPanel,
        null,
        createElement(Action.SubmitForm, { title: "Update Todo", onSubmit: handleSubmit }),
      ),
    },
    createElement(Form.Description, { title: "Companion", text: `${todo.title} (${contextLabel})` }),
    createElement(Form.TextField, { id: "title", title: "Title", defaultValue: todo.title }),
    createElement(Form.TextArea, {
      id: "description",
      title: "Description",
      defaultValue: todo.description ?? "",
    }),
    createElement(
      Form.Dropdown,
      { id: "status", title: "Status", defaultValue: todo.status },
      ...STATUSES.map((status) =>
        createElement(Form.Dropdown.Item, { key: status, value: status, title: STATUS_LABELS[status] }),
      ),
    ),
  );
}

export default function Command() {
  const context = useWorkspaceContext();
  const { baseUrl, headers } = getApiConfig();
  const { isLoading, data, error } = useFetch<CompanionSnapshotDto>(
    context ? `${baseUrl}/todos/companion?context=${encodeURIComponent(context)}` : "",
    { headers, execute: Boolean(context) },
  );

  if (error) {
    return createElement(Detail, { markdown: `Failed to load companion todo.\n\n${error.message}` });
  }

  if (!context || isLoading || !data) {
    return createElement(Form, { isLoading: true });
  }

  const todo = resolveCompanionTodo(data);
  if (!todo) {
    return createElement(Detail, {
      markdown: `No companion todo found for **${formatContextLabel(context)}**.`,
    });
  }

  return createElement(EditCompanionForm, {
    key: todo.id,
    todo,
    contextLabel: formatContextLabel(context),
  });
}

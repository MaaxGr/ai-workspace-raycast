import { Action, ActionPanel, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { createElement, useState } from "react";
import { apiRequest, CreateTodoDto, TodoDto } from "./api";
import { formatContextLabel, useWorkspaceContext } from "./context";

export default function Command() {
  const context = useWorkspaceContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: Form.Values) {
    const title = String(values.title ?? "").trim();
    if (!title) {
      await showToast({ style: Toast.Style.Failure, title: "Title is required" });
      return;
    }

    if (!context) {
      await showToast({ style: Toast.Style.Failure, title: "Context is still loading" });
      return;
    }

    setIsSubmitting(true);
    try {
      const body: CreateTodoDto = { title, context };
      const description = String(values.description ?? "").trim();
      if (description) {
        body.description = description;
      }

      const todo = await apiRequest<TodoDto>("/todos", {
        method: "POST",
        body: JSON.stringify(body),
      });

      await showToast({ style: Toast.Style.Success, title: `Created "${todo.title}"` });
      await popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to create todo",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return createElement(
    Form,
    {
      isLoading: !context || isSubmitting,
      actions: createElement(
        ActionPanel,
        null,
        createElement(Action.SubmitForm, { title: "Create Todo", onSubmit: handleSubmit }),
      ),
    },
    createElement(Form.Description, {
      title: "Context",
      text: context ? formatContextLabel(context) : "Loading...",
    }),
    createElement(Form.TextField, { id: "title", title: "Title", placeholder: "Todo title" }),
    createElement(Form.TextArea, { id: "description", title: "Description" }),
  );
}

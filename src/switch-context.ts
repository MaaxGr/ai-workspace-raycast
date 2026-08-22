import { showToast, Toast, updateCommandMetadata } from "@raycast/api";
import { formatContextLabel, toggleWorkspaceContext } from "./context";

export default async function Command() {
  const next = await toggleWorkspaceContext();
  const label = formatContextLabel(next);

  await updateCommandMetadata({ subtitle: label });
  await showToast({ style: Toast.Style.Success, title: `Context: ${label}` });
}

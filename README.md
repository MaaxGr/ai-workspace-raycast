# AI Workspace for Raycast

Raycast extension for [AI Workspace](https://ai-workspace.grossmax.net). Create todos, update the active companion todo, and switch between Work and Private context.

Works on **Windows** and **macOS**.

## Setup

1. Install [Raycast](https://www.raycast.com/).
2. Clone this repository and install dependencies:

   ```sh
   npm install
   npm run dev
   ```

3. Open **Raycast → Extensions → AI Workspace** and set:

   | Preference     | Description                                      | Default                   |
   | -------------- | ------------------------------------------------ | ------------------------- |
   | API Base URL   | Base URL of the AI Workspace API                 | `http://localhost:3001`   |
   | API Token      | Bearer token used to authenticate API requests   | —                         |

Requests send `Authorization: Bearer <token>` to the configured base URL.

## Commands

### Create Todo

Opens a form to create a todo via `POST /todos`.

- **Title** (required)
- **Description** (optional)
- Uses the current workspace context (Work or Private)

### Update Companion Todo

Loads `GET /todos/companion` for the current context, then updates that todo via `PATCH /todos/{id}`.

The target todo is the one with an **active timer**, or the first recent todo if none is running. You can edit title, description, and status (`NEW`, `FOCUS`, `IN_PROGRESS`, `DONE`).

### Switch Context

Toggles workspace context between **Work** and **Private**. Create Todo and Update Companion Todo both use this value. The default is Work until you switch.

## Development

| Script            | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Load the extension in Raycast       |
| `npm run build`   | Production build                    |
| `npm run lint`    | Lint                                |
| `npm run fix-lint`| Lint and auto-fix                   |

The AI Workspace OpenAPI spec (`/api/docs-json`) is the source of truth for endpoints and DTOs.

## License

MIT

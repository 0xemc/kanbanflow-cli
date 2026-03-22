# KanbanFlow Task Management

Manage KanbanFlow tasks, boards, and subtasks using the kanbanflow-cli project.

## When to Use

Use this skill when the user wants to:
- Create, list, update, or delete KanbanFlow tasks
- View board structure (columns and swimlanes)
- Add or manage subtasks
- Organize tasks with labels or colors
- Set time estimates or track time
- Move tasks between columns or swimlanes

## Available Commands

### Board Commands
- View board structure: columns, swimlanes, IDs

### Task Commands
- List tasks (all, by column, or by swimlane)
- Show task details
- Create new tasks with options (name, column, swimlane, color, time, points)
- Update existing tasks
- Move tasks between columns

### Subtask Commands
- Add subtasks to tasks
- Update subtask status (finished/unfinished)
- Rename subtasks

## Board Structure

The Weekly board has these columns:
- **Blocked** (t9KXhq9wirzY)
- **Backlog** (tAyDg4xV0LVu)
- **Up Next** (tBRsMGsBFNVQ)
- **Monday** (tCYMGmsIgjn2)
- **Tuesday** (tDwTgBGWs6Bj)
- **Wednesday** (tEZbovFdGAmV)
- **Thursday** (tFsN3RUxkhSV)
- **Friday** (tGCOEnEvnEE1)
- **Saturday** (jrMU18XHKJvi)
- **Sunday** (jsuB8tlNlRo4)
- **Done** (tH4X9SI3pk6u)

Swimlanes:
- **🛠️ Work** (tIZ7lgysc1gP)
- **📒 Personal** (tJo2tmD6C8eK)
- **🤼 Grappling** (tKj4BTPzndRK)
- **Archive** (tMZNGGOObgOW)

## Implementation

The CLI is located at `/workspace/group/projects/kanbanflow-cli/`.

Always set the API token environment variable before running commands:
```bash
export KANBANFLOW_API_TOKEN=66LKS5aBySsZZtpUNg6agkeKR2
```

Run commands using:
```bash
cd /workspace/group/projects/kanbanflow-cli && \
export KANBANFLOW_API_TOKEN=66LKS5aBySsZZtpUNg6agkeKR2 && \
node dist/index.js [command]
```

### Common Patterns

**Create a task:**
```bash
node dist/index.js task create \
  --name "Task name" \
  --column COLUMN_ID \
  --swimlane SWIMLANE_ID \
  --time 900 \
  --color blue
```

**List tasks:**
```bash
node dist/index.js task list
node dist/index.js task list --column tCYMGmsIgjn2
node dist/index.js task list --column tCYMGmsIgjn2 --swimlane tKj4BTPzndRK
```

**Show board:**
```bash
node dist/index.js board show
```

**Add subtask:**
```bash
node dist/index.js subtask add TASK_ID --name "Subtask name"
```

## Task Properties

- **Colors**: yellow, white, red, green, blue, purple, orange, cyan, brown, magenta
- **Time**: In seconds (900 = 15 min, 1800 = 30 min, 3600 = 1 hour)
- **Points**: Story points for estimation

## Tips

- When creating multiple similar tasks (e.g., recurring sessions), use a loop or multiple commands
- Always verify column/swimlane IDs with `board show` if unsure
- Use descriptive task names to make the board more readable
- Color-code tasks by type or priority for visual organization

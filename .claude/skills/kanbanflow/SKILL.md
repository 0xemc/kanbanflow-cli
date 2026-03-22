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

## Implementation

The CLI is located at `/workspace/group/projects/kanbanflow-cli/`.

### Setup

Always set the API token environment variable before running commands. Check for the token in:
1. `.env` file in the project directory
2. User's config at `~/.kanbanflow-cli/config.json`
3. Ask the user if not found

```bash
export KANBANFLOW_API_TOKEN=<token>
```

### Running Commands

```bash
cd /workspace/group/projects/kanbanflow-cli && \
export KANBANFLOW_API_TOKEN=<token> && \
node dist/index.js [command]
```

## Available Commands

### Board Commands

**View board structure:**
```bash
node dist/index.js board show
```

This displays all columns and swimlanes with their IDs. Always run this first to get the correct IDs for the user's board.

### Task Commands

**List tasks:**
```bash
# All tasks
node dist/index.js task list

# Tasks in specific column
node dist/index.js task list --column COLUMN_ID

# Tasks in column + swimlane
node dist/index.js task list --column COLUMN_ID --swimlane SWIMLANE_ID
```

**Show task details:**
```bash
node dist/index.js task show TASK_ID
```

**Create a task:**
```bash
node dist/index.js task create \
  --name "Task name" \
  --column COLUMN_ID \
  [--swimlane SWIMLANE_ID] \
  [--description "Details"] \
  [--color COLOR] \
  [--points NUMBER] \
  [--time SECONDS] \
  [--position top|bottom|NUMBER]
```

**Update a task:**
```bash
node dist/index.js task update TASK_ID \
  [--name "New name"] \
  [--column NEW_COLUMN_ID] \
  [--color COLOR] \
  [--points NUMBER]
```

### Subtask Commands

**Add subtask:**
```bash
node dist/index.js subtask add TASK_ID --name "Subtask name"
node dist/index.js subtask add TASK_ID --name "Subtask name" --index 0
```

**Update subtask:**
```bash
node dist/index.js subtask update TASK_ID SUBTASK_INDEX --finished true
node dist/index.js subtask update TASK_ID SUBTASK_INDEX --name "New name"
```

## Task Properties

### Colors
Available values: `yellow`, `white`, `red`, `green`, `blue`, `purple`, `orange`, `cyan`, `brown`, `magenta`

Default: `yellow`

### Time Estimates
Time is specified in seconds:
- 15 minutes = 900 seconds
- 30 minutes = 1800 seconds
- 1 hour = 3600 seconds
- 2 hours = 7200 seconds
- 1 day (8 hours) = 28800 seconds

### Position
When creating tasks:
- `top` - Add to top of column
- `bottom` - Add to bottom of column (default)
- `0`, `1`, `2`... - Specific position index

### Points
Story points for estimation (any number)

## Workflow

1. **Always start by getting board structure:**
   ```bash
   node dist/index.js board show
   ```
   This shows all available columns and swimlanes with their IDs.

2. **Use the IDs from step 1** when creating or updating tasks

3. **For recurring tasks**, use loops or multiple commands to create similar tasks

## Examples

### Create a simple task
```bash
node dist/index.js task create \
  --name "Review pull request" \
  --column C_TODO_ID \
  --color blue
```

### Create task with full details
```bash
node dist/index.js task create \
  --name "Implement feature X" \
  --column C_TODO_ID \
  --swimlane S_WORK_ID \
  --description "Add new authentication flow" \
  --color purple \
  --points 8 \
  --time 14400 \
  --position top
```

### Move task to different column
```bash
node dist/index.js task update TASK_ID --column C_DONE_ID
```

### Add multiple subtasks
```bash
node dist/index.js subtask add TASK_ID --name "Research"
node dist/index.js subtask add TASK_ID --name "Design"
node dist/index.js subtask add TASK_ID --name "Implement"
node dist/index.js subtask add TASK_ID --name "Test"
```

## Tips

- Always run `board show` first to get current column and swimlane IDs
- Use descriptive task names for better board readability
- Color-code tasks by type or priority for visual organization
- Set time estimates to help with planning and tracking
- Use swimlanes to categorize tasks by project or area of responsibility

---
name: kanbanflow
description: CLI tool for managing KanbanFlow tasks, boards, and subtasks. Use when creating, listing, updating, or organizing Kanban tasks and subtasks.
---

# KanbanFlow CLI

After `npm install && npm run build && npm link`, use the `kanban` command globally.

## Authentication

```bash
kanban config set-token           # interactive
kanban config set-token YOUR_TOKEN
kanban config show

# Or via environment variable:
export KANBANFLOW_API_TOKEN=your_token
```

Get token from KanbanFlow: Menu > Settings > API & Webhooks > Add API Token.

Config stored at `~/.kanbanflow-cli/config.json`.

## Commands

### Board

```bash
kanban board show    # view columns and swimlanes
```

### Tasks

```bash
# List
kanban task list
kanban task list --column C9LIn5sEEpqT
kanban task list --column C9LIn5sEEpqT --swimlane S123456

# Show
kanban task show T3s6UGyzY

# Create (interactive or with flags)
kanban task create
kanban task create \
  --name "Task name" \
  --column COLUMN_ID \
  --description "Details" \
  --color green \       # yellow|white|red|green|blue|purple|orange|cyan|brown|magenta
  --points 5 \
  --time 7200 \         # seconds (3600 = 1hr, 28800 = 1 day)
  --position top        # top|bottom|0|1|2...

# Update
kanban task update T3s6UGyzY --name "New name" --color blue --points 3
kanban task update T3s6UGyzY --column C_DONE_123   # move to column
```

### Subtasks

```bash
kanban subtask add T3s6UGyzY --name "Step 1"
kanban subtask add T3s6UGyzY --name "Step 1" --index 0   # specific position

kanban subtask update T3s6UGyzY 0 --finished true
kanban subtask update T3s6UGyzY 0 --name "Updated step"
```

## Notes

- Column and swimlane IDs come from `kanban board show`
- Task IDs come from `kanban task list`
- Time helper: `$(( hours * 3600 ))` in bash

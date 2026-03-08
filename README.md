# KanbanFlow CLI

A powerful command-line interface for managing your KanbanFlow tasks built with TypeScript.

## Features

- 📋 **Board Management** - View board structure, columns, and swimlanes
- ✅ **Task Operations** - Create, read, update tasks with full field support
- 🔢 **Subtask Management** - Add and update subtasks
- 🏷️ **Label Management** - Organize tasks with labels
- 💬 **Comments** - Add and update task comments
- ⏱️ **Time Tracking** - Set estimates and track time spent
- 🎨 **Color Coding** - Visual task categorization
- 🔐 **Secure Authentication** - Token-based API authentication

## Installation

```bash
npm install
npm run build
npm link
```

## Configuration

Before using the CLI, set up your API token:

```bash
kanban config set-token
```

You can get your API token from KanbanFlow:
1. Go to Menu > Settings > API & Webhooks
2. Click "Add API Token"
3. Copy the generated token

Alternatively, set the token via environment variable:

```bash
export KANBANFLOW_API_TOKEN=your_token_here
```

## Usage

### Configuration Commands

```bash
# Set API token (interactive)
kanban config set-token

# Set API token (direct)
kanban config set-token YOUR_TOKEN

# Show current configuration
kanban config show
```

### Board Commands

```bash
# Show board structure
kanban board show
```

### Task Commands

```bash
# List all tasks organized by columns
kanban task list

# List tasks in a specific column
kanban task list --column C9LIn5sEEpqT

# List tasks in a swimlane column
kanban task list --column C9LIn5sEEpqT --swimlane S123456

# Show task details
kanban task show T3s6UGyzY

# Create a new task (interactive)
kanban task create

# Create a task with options
kanban task create \
  --name "Implement feature X" \
  --column C9LIn5sEEpqT \
  --description "Add new functionality" \
  --color green \
  --points 5 \
  --time 7200

# Update a task
kanban task update T3s6UGyzY \
  --name "Updated task name" \
  --color blue \
  --points 3
```

### Subtask Commands

```bash
# Add a subtask
kanban subtask add T3s6UGyzY --name "Complete step 1"

# Add a subtask at specific position
kanban subtask add T3s6UGyzY --name "Complete step 1" --index 0

# Mark subtask as finished
kanban subtask update T3s6UGyzY 0 --finished true

# Update subtask name
kanban subtask update T3s6UGyzY 0 --name "Updated step name"
```

## API Reference

### Task Colors

Available colors:
- `yellow` (default)
- `white`
- `red`
- `green`
- `blue`
- `purple`
- `orange`
- `cyan`
- `brown`
- `magenta`

### Task Positions

- `top` - Add to top of column
- `bottom` - Add to bottom of column
- `0`, `1`, `2`... - Specific position index

### Time Estimates

Time is specified in seconds:
- 1 hour = 3600 seconds
- 1 day = 28800 seconds (8 hours)
- Helper: Use `$(( hours * 3600 ))` in bash

## Examples

### Create a Task with Full Details

```bash
kanban task create \
  --name "Design new landing page" \
  --column C9LIn5sEEpqT \
  --description "Create mockups and get approval" \
  --color purple \
  --points 8 \
  --time 14400 \
  --position top
```

### Move Task to Different Column

```bash
kanban task update T3s6UGyzY --column C_DONE_123
```

### Add Multiple Subtasks

```bash
kanban subtask add T3s6UGyzY --name "Research competitors"
kanban subtask add T3s6UGyzY --name "Create wireframes"
kanban subtask add T3s6UGyzY --name "Design mockups"
kanban subtask add T3s6UGyzY --name "Get feedback"
```

## Configuration File

The CLI stores configuration in `~/.kanbanflow-cli/config.json`:

```json
{
  "apiToken": "your_token_here",
  "baseUrl": "https://kanbanflow.com/api/v1"
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run the built version
npm start
```

## Project Structure

```
src/
├── api/
│   └── client.ts          # KanbanFlow API client
├── commands/
│   ├── board.ts           # Board commands
│   ├── config.ts          # Configuration commands
│   ├── task.ts            # Task commands
│   └── subtask.ts         # Subtask commands
├── types/
│   └── index.ts           # TypeScript type definitions
├── utils/
│   ├── config.ts          # Configuration management
│   └── format.ts          # Output formatting
└── index.ts               # CLI entry point
```

## API Documentation

For complete API documentation, visit:
- https://kanbanflow.com/administration/board/YOUR_BOARD_ID/api

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Built with ❤️ using TypeScript and the KanbanFlow API

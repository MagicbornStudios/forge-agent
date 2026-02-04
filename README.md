# Forge Agent PoC

A proof-of-concept AI agent system for editing React Flow graphs using natural language through CopilotKit.

## Features

- **React Flow Graph Editor**: Interactive visual graph editor with node types (Character, Player, Conditional)
- **AI Agent Integration**: Natural language graph editing via CopilotKit
- **Real-time Updates**: See changes immediately as the AI modifies the graph
- **PayloadCMS Backend**: SQLite database for graph storage (no admin UI)
- **Type-Safe Operations**: Comprehensive TypeScript types for graph operations
- **Tested**: Unit tests for core graph operations

## Architecture

- **Frontend**: Next.js 15 + React Flow + CopilotKit
- **State Management**: Zustand for graph state
- **Backend**: PayloadCMS with SQLite
- **AI**: OpenRouter API (OpenAI-compatible)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure `.env.local` has the OpenRouter API key (already configured):
```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-or-v1-...  # CopilotKit uses this
PAYLOAD_SECRET=dev-secret-change-me
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Open the app** - You'll see a sample graph with one "Start" node
2. **Open the AI chat** - Click the AI icon on the right side
3. **Ask the AI to edit the graph**:
   - "Add 3 character nodes"
   - "Create a dialogue between two characters"
   - "Add a player choice node"
   - "Connect the start node to a new character node"
   - "Update the start node's content"
   - "Delete a node"

## AI Actions Available

- **createNode** - Add new nodes (CHARACTER, PLAYER, CONDITIONAL)
- **updateNode** - Modify node properties (label, content, speaker)
- **deleteNode** - Remove nodes from graph
- **createEdge** - Connect nodes together
- **getGraph** - View current graph state

## Example Prompts

**Simple operations:**
- "Add a character node named 'Bartender' with dialogue 'Welcome to the tavern'"
- "Create a player choice node"
- "Connect the start node to the bartender node"

**Complex operations:**
- "Create a dialogue tree with a bartender greeting, player choices to ask about quests or leave, and appropriate responses"
- "Add 5 character nodes for tavern NPCs: Bartender, Guard, Merchant, Bard, and Patron"

## Project Structure

```
/app
  /api
    /copilotkit       # CopilotKit runtime endpoint
    /graphs           # REST API for graphs
  layout.tsx          # Root layout
  page.tsx            # Main app page
  globals.css         # Global styles
/collections
  forge-graphs.ts     # PayloadCMS collection config
/components
  /nodes              # React Flow node components
    CharacterNode.tsx
    PlayerNode.tsx
    ConditionalNode.tsx
  GraphEditor.tsx     # React Flow editor
  Workspace.tsx       # Main workspace with CopilotKit
/lib
  copilot-actions.ts  # AI agent actions
  graph-operations.ts # Graph operation logic
  store.ts            # Zustand store
/types
  graph.ts            # TypeScript types
/__tests__
  graph-operations.test.ts
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Building for Production

```bash
npm run build
npm start
```

## Technical Details

### Graph Data Structure

Graphs are stored in SQLite via PayloadCMS with this structure:

```typescript
{
  id: number;
  title: string;
  flow: {
    nodes: ForgeReactFlowNode[];
    edges: ForgeReactFlowEdge[];
    viewport?: { x, y, zoom };
  };
}
```

### Patch Operations

The AI agent generates patch operations that are applied to the graph:

- `createNode` - Add node at position with data
- `updateNode` - Modify node properties
- `moveNode` - Change node position
- `deleteNode` - Remove node and connected edges
- `createEdge` - Connect two nodes
- `deleteEdge` - Remove connection

### State Management

- **Zustand store** maintains graph state
- **Draft/committed** pattern for unsaved changes
- **Auto-save** when changes occur
- **isDirty** flag tracks unsaved state

## Future Enhancements

- [ ] Visual diff system (show before/after)
- [ ] Planning workflow (multi-step operations with preview/approval)
- [ ] Version history (undo/redo)
- [ ] Batch operations (large graph modifications)
- [ ] Graph validation (prevent invalid structures)
- [ ] Export/import (JSON, Yarn Spinner)

## Dependencies

**Core**:
- next@15.5.9
- react@19.2.1
- reactflow@11.11.4
- zustand@5.0.9

**AI**:
- @copilotkit/react-core@1.51.2
- @copilotkit/react-ui@1.51.2
- @copilotkit/runtime@1.51.2
- openai@5.23.2

**Backend**:
- payload@3.74.0
- @payloadcms/db-sqlite@3.0.0
- @payloadcms/next@3.0.0

## License

MIT

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NoteRepository } from '../storage/repositories/note.repository.js';
import { TaskRepository } from '../storage/repositories/task.repository.js';
import { createNoteTool, setNoteRepository as setCreateNoteRepo } from './notes/create-note.js';
import { getNotesByTaskTool, setNoteRepository as setGetNotesRepo } from './notes/get-notes.js';
import { searchNotesTool, setNoteRepository as setSearchNotesRepo } from './notes/search-notes.js';
import { updateNoteStatusTool, setNoteRepository as setUpdateNoteRepo } from './notes/update-note.js';
import { createTaskTool, setTaskRepository as setCreateTaskRepo } from './tasks/create-task.js';
import { getTaskTool, setTaskRepository as setGetTaskRepo } from './tasks/get-task.js';
import { listTasksTool, setTaskRepository as setListTasksRepo } from './tasks/list-tasks.js';

export interface RepositoryContainer {
  noteRepository?: NoteRepository;
  taskRepository?: TaskRepository;
}

// Función para registrar herramientas con inyección de dependencias
export function registerTools(server: McpServer, repositories?: RepositoryContainer): void {
  // CRITICAL: Inject repositories into tools to enable real database persistence
  if (repositories?.noteRepository) {
    setCreateNoteRepo(repositories.noteRepository);
    setGetNotesRepo(repositories.noteRepository);
    setSearchNotesRepo(repositories.noteRepository);
    setUpdateNoteRepo(repositories.noteRepository);
  }

  if (repositories?.taskRepository) {
    setCreateTaskRepo(repositories.taskRepository);
    setGetTaskRepo(repositories.taskRepository);
    setListTasksRepo(repositories.taskRepository);
  }

  server.tool(
    createNoteTool.id,
    createNoteTool.description,
    createNoteTool.inputSchema.shape,
    createNoteTool.handler
  );

  server.tool(
    getNotesByTaskTool.id,
    getNotesByTaskTool.description,
    getNotesByTaskTool.inputSchema.shape,
    getNotesByTaskTool.handler
  );

  server.tool(
    searchNotesTool.id,
    searchNotesTool.description,
    searchNotesTool.inputSchema.shape,
    searchNotesTool.handler
  );

  server.tool(
    updateNoteStatusTool.id,
    updateNoteStatusTool.description,
    updateNoteStatusTool.inputSchema.shape,
    updateNoteStatusTool.handler
  );

  server.tool(
    createTaskTool.id,
    createTaskTool.description,
    createTaskTool.inputSchema.shape,
    createTaskTool.handler
  );

  server.tool(
    getTaskTool.id,
    getTaskTool.description,
    getTaskTool.inputSchema.shape,
    getTaskTool.handler
  );

  server.tool(
    listTasksTool.id,
    listTasksTool.description,
    listTasksTool.inputSchema.shape,
    listTasksTool.handler
  );

  // Use stderr to avoid contaminating MCP JSON-RPC stdout
  console.error('All SRP-MCP tools registered successfully');
}
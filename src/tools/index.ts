import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NoteRepository } from '../storage/repositories/note.repository.js';
import { TaskRepository } from '../storage/repositories/task.repository.js';
import { createNoteTool } from './notes/create-note.js';
import { getNotesByTaskTool } from './notes/get-notes.js';
import { searchNotesTool } from './notes/search-notes.js';
import { updateNoteStatusTool } from './notes/update-note.js';
import { createTaskTool } from './tasks/create-task.js';
import { getTaskTool } from './tasks/get-task.js';
import { listTasksTool } from './tasks/list-tasks.js';

interface RepositoryContainer {
  noteRepository?: NoteRepository;
  taskRepository?: TaskRepository;
}

// Función para registrar herramientas con inyección de dependencias
export function registerTools(server: McpServer, repositories?: RepositoryContainer): void {
  // En una implementación completa, aquí inyectaríamos los repositorios a las herramientas
  // Por ahora, solo registramos las herramientas tal como están
  
  server.tool(createNoteTool);
  server.tool(getNotesByTaskTool);
  server.tool(searchNotesTool);
  server.tool(updateNoteStatusTool);
  
  server.tool(createTaskTool);
  server.tool(getTaskTool);
  server.tool(listTasksTool);
  
  console.log('All SRP-MCP tools registered successfully');
}
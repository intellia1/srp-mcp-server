import { z } from 'zod';
import Logger from '../../utils/logger.js';

// Definición de la herramienta para buscar notas
export const searchNotesTool = {
  id: 'search_notes',
  description: 'Busca notas según criterios específicos como contenido, tarea o subtarea',
  inputSchema: z.object({
    query: z.string().optional().describe('Texto a buscar en el contenido de las notas'),
    task_id: z.string().optional().describe('ID de tarea para filtrar notas'),
    subtask_id: z.string().optional().describe('ID de subtarea para filtrar notas'),
    agent_id: z.string().optional().describe('ID del agente para filtrar notas'),
    limit: z.number().optional().default(10).describe('Número máximo de resultados a devolver'),
    offset: z.number().optional().default(0).describe('Número de resultados a omitir (para paginación)')
  }),
  handler: async (params: any) => {
    try {
      Logger.debug('Searching notes', { params });
      
      // Validar los parámetros de entrada
      const inputData = searchNotesTool.inputSchema.parse(params);
      
      // Aquí iría la lógica para buscar notas en la base de datos
      // Por ahora, simulamos resultados de búsqueda
      const mockNotes = [
        {
          note_id: 'note_20251005_001',
          agent_id: inputData.agent_id || 'mock-agent',
          task_id: inputData.task_id || 'session_20251005_001',
          timestamp: new Date().toISOString(),
          task_title: 'Mock Task Title',
          subtask_id: inputData.subtask_id || 'subtask_20251005_001',
          subtask_title: 'Mock Subtask Title',
          content: `This is a mock note containing the search query: ${inputData.query || 'all'}`,
          subtask_status: 'completed',
          public_state: true
        }
      ];
      
      Logger.info('Notes searched successfully', { 
        query: inputData.query, 
        taskId: inputData.task_id, 
        count: mockNotes.length 
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            query: inputData.query,
            task_id: inputData.task_id,
            subtask_id: inputData.subtask_id,
            agent_id: inputData.agent_id,
            notes: mockNotes,
            count: mockNotes.length,
            limit: inputData.limit,
            offset: inputData.offset
          }, null, 2)
        }]
      };
    } catch (error: any) {
      Logger.error('Error searching notes', { error: error.message, params });
      
      return {
        content: [{
          type: 'text',
          text: `Error al buscar las notas: ${error.message}`
        }]
      };
    }
  }
} as const;
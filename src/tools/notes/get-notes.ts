import { z } from 'zod';
import Logger from '../../utils/logger.js';

// Definición de la herramienta para obtener notas por tarea
export const getNotesByTaskTool = {
  id: 'get_notes_by_task',
  description: 'Obtiene todas las notas asociadas a una tarea específica',
  inputSchema: z.object({
    task_id: z.string().describe('ID de la tarea para obtener sus notas (formato: session_YYYYMMDD_NNN)'),
    agent_id: z.string().optional().describe('ID opcional del agente para filtrar notas')
  }),
  handler: async (params: any) => {
    try {
      Logger.debug('Getting notes by task', { params });
      
      // Validar los parámetros de entrada
      const inputData = getNotesByTaskTool.inputSchema.parse(params);
      
      // Aquí iría la lógica para recuperar las notas de la base de datos
      // Por ahora, simulamos notas de ejemplo
      const mockNotes = [
        {
          note_id: 'note_20251005_001',
          agent_id: inputData.agent_id || 'mock-agent',
          task_id: inputData.task_id,
          timestamp: new Date().toISOString(),
          task_title: 'Mock Task Title',
          subtask_id: 'subtask_20251005_001',
          subtask_title: 'Mock Subtask Title',
          content: 'This is a mock note for demonstration purposes',
          subtask_status: 'completed',
          public_state: true
        }
      ];
      
      Logger.info('Notes retrieved successfully', { taskId: inputData.task_id, count: mockNotes.length });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            task_id: inputData.task_id,
            notes: mockNotes,
            count: mockNotes.length
          }, null, 2)
        }]
      };
    } catch (error: any) {
      Logger.error('Error getting notes by task', { error: error.message, params });
      
      return {
        content: [{
          type: 'text',
          text: `Error al obtener las notas: ${error.message}`
        }]
      };
    }
  }
} as const;
import { z } from 'zod';
import Logger from '../../utils/logger.js';

// Definición de la herramienta para obtener una tarea
export const getTaskTool = {
  id: 'get_task',
  description: 'Obtiene una tarea específica con todas sus notas asociadas',
  inputSchema: z.object({
    task_id: z.string().describe('ID de la tarea a obtener (formato: session_YYYYMMDD_NNN)'),
    agent_id: z.string().optional().describe('ID opcional del agente para verificar permisos')
  }),
  handler: async (params: any) => {
    try {
      Logger.debug('Getting task', { params });
      
      // Validar los parámetros de entrada
      const inputData = getTaskTool.inputSchema.parse(params);
      
      // Aquí iría la lógica para recuperar la tarea y sus notas de la base de datos
      // Por ahora, simulamos una tarea con notas
      const mockTask = {
        task_id: inputData.task_id,
        agent_id: inputData.agent_id || 'mock-agent',
        title: 'Mock Task Title',
        description: 'This is a mock task for demonstration purposes',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'in_progress',
        notes: [
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
        ]
      };
      
      Logger.info('Task retrieved successfully', { taskId: inputData.task_id });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            task: mockTask
          }, null, 2)
        }]
      };
    } catch (error: any) {
      Logger.error('Error getting task', { error: error.message, params });
      
      return {
        content: [{
          type: 'text',
          text: `Error al obtener la tarea: ${error.message}`
        }]
      };
    }
  }
} as const;
import { z } from 'zod';
import Logger from '../../utils/logger.js';
import { TaskRepository } from '../../storage/repositories/task.repository.js';

// Repository injection
let taskRepository: TaskRepository | undefined;

export const setTaskRepository = (repository: TaskRepository) => {
  taskRepository = repository;
};

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

      // Database logic using repository
      if (taskRepository) {
        try {
          const task = await taskRepository.findById(
            inputData.task_id,
            inputData.agent_id
          );

          if (!task) {
            Logger.warn('Task not found', { taskId: inputData.task_id });
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({
                  success: false,
                  message: `Tarea no encontrada: ${inputData.task_id}`
                }, null, 2)
              }]
            };
          }

          Logger.info('Task retrieved successfully from database', { taskId: inputData.task_id });

          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                task: task
              }, null, 2)
            }]
          };
        } catch (dbError: any) {
          Logger.error('Error from database', { error: dbError.message });
          return {
            content: [{
              type: 'text' as const,
              text: `Error al obtener la tarea de la base de datos: ${dbError.message}`
            }]
          };
        }
      }

      // Fallback: mock data when repository is not configured
      Logger.warn('No repository configured - returning mock data');

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

      Logger.info('Task retrieved successfully (mock)', { taskId: inputData.task_id });

      return {
        content: [{
          type: 'text' as const,
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
          type: 'text' as const,
          text: `Error al obtener la tarea: ${error.message}`
        }]
      };
    }
  }
} as const;
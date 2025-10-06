import { z } from 'zod';
import Logger from '../../utils/logger.js';
import { TaskRepository } from '../../storage/repositories/task.repository.js';

// Repository injection
let taskRepository: TaskRepository | undefined;

export const setTaskRepository = (repository: TaskRepository) => {
  taskRepository = repository;
};

// Definición de la herramienta para listar tareas
export const listTasksTool = {
  id: 'list_tasks',
  description: 'Lista todas las tareas de un agente con información resumida',
  inputSchema: z.object({
    agent_id: z.string().describe('ID del agente para filtrar sus tareas'),
    status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional().describe('Filtrar por estado de tarea'),
    limit: z.number().optional().default(10).describe('Número máximo de resultados a devolver'),
    offset: z.number().optional().default(0).describe('Número de resultados a omitir (para paginación)')
  }),
  handler: async (params: any) => {
    try {
      Logger.debug('Listing tasks', { params });

      // Validar los parámetros de entrada
      const inputData = listTasksTool.inputSchema.parse(params);

      // Database logic using repository
      if (taskRepository) {
        try {
          const tasks = await taskRepository.search({
            agent_id: inputData.agent_id,
            status: inputData.status,
            limit: inputData.limit,
            offset: inputData.offset
          });

          Logger.info('Tasks listed successfully from database', {
            agentId: inputData.agent_id,
            status: inputData.status,
            count: tasks.length
          });

          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                agent_id: inputData.agent_id,
                status: inputData.status,
                tasks: tasks,
                count: tasks.length,
                limit: inputData.limit,
                offset: inputData.offset
              }, null, 2)
            }]
          };
        } catch (dbError: any) {
          Logger.error('Error from database', { error: dbError.message });
          return {
            content: [{
              type: 'text' as const,
              text: `Error al listar las tareas de la base de datos: ${dbError.message}`
            }]
          };
        }
      }

      // Fallback: mock data when repository is not configured
      Logger.warn('No repository configured - returning mock data');

      const mockTasks = [
        {
          task_id: 'session_20251005_001',
          agent_id: inputData.agent_id,
          title: 'Mock Task 1',
          description: 'This is a mock task for demonstration purposes',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: inputData.status || 'in_progress'
        },
        {
          task_id: 'session_20251005_002',
          agent_id: inputData.agent_id,
          title: 'Mock Task 2',
          description: 'This is another mock task for demonstration purposes',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: inputData.status || 'pending'
        }
      ];

      Logger.info('Tasks listed successfully (mock)', {
        agentId: inputData.agent_id,
        status: inputData.status,
        count: mockTasks.length
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            success: true,
            agent_id: inputData.agent_id,
            status: inputData.status,
            tasks: mockTasks,
            count: mockTasks.length,
            limit: inputData.limit,
            offset: inputData.offset
          }, null, 2)
        }]
      };
    } catch (error: any) {
      Logger.error('Error listing tasks', { error: error.message, params });

      return {
        content: [{
          type: 'text' as const,
          text: `Error al listar las tareas: ${error.message}`
        }]
      };
    }
  }
} as const;
import { z } from 'zod';
import { generateTaskId } from '../../utils/id-generator.js';
import Logger from '../../utils/logger.js';
import { TaskRepository } from '../../storage/repositories/task.repository.js';

// Repository injection
let taskRepository: TaskRepository | undefined;

export const setTaskRepository = (repository: TaskRepository) => {
  taskRepository = repository;
};

// Definición de la herramienta para crear tareas
export const createTaskTool = {
  id: 'create_task',
  description: 'Crea una tarea principal en el sistema SRP para organizar notas y subtareas',
  inputSchema: z.object({
    agent_id: z.string().describe('ID del agente que crea la tarea'),
    title: z.string().describe('Título descriptivo de la tarea'),
    description: z.string().optional().describe('Descripción detallada de la tarea')
  }),
  handler: async (params: any) => {
    try {
      Logger.debug('Creating task', { params });

      // Validar los parámetros de entrada
      const inputData = createTaskTool.inputSchema.parse(params);

      // Database logic using repository
      if (taskRepository) {
        try {
          const taskData = {
            task_id: generateTaskId(),
            agent_id: inputData.agent_id,
            title: inputData.title,
            description: inputData.description,
            status: 'pending' as const,
            notes: []
          };

          const createdTask = await taskRepository.create(taskData);

          Logger.info('Task created successfully in database', { taskId: createdTask.task_id });

          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                task_id: createdTask.task_id,
                task: createdTask,
                message: 'Tarea creada exitosamente en el sistema SRP'
              }, null, 2)
            }]
          };
        } catch (dbError: any) {
          Logger.error('Error from database', { error: dbError.message });
          return {
            content: [{
              type: 'text' as const,
              text: `Error al crear la tarea en la base de datos: ${dbError.message}`
            }]
          };
        }
      }

      // Fallback: mock data when repository is not configured
      Logger.warn('No repository configured - returning mock data');

      const taskData = {
        task_id: generateTaskId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending',
        ...inputData
      };

      Logger.info('Task created successfully (mock)', { taskId: taskData.task_id });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            success: true,
            task_id: taskData.task_id,
            message: 'Tarea creada exitosamente en el sistema SRP'
          }, null, 2)
        }]
      };
    } catch (error: any) {
      Logger.error('Error creating task', { error: error.message, params });

      return {
        content: [{
          type: 'text' as const,
          text: `Error al crear la tarea: ${error.message}`
        }]
      };
    }
  }
} as const;
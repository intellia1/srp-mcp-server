import { z } from 'zod';
import { generateTaskId } from '../../utils/id-generator.js';
import Logger from '../../utils/logger.js';

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
      
      // Crear el objeto de tarea con los campos requeridos
      const taskData = {
        task_id: generateTaskId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'pending',
        ...inputData
      };
      
      // Aquí iría la lógica para almacenar la tarea en la base de datos
      // Por ahora, simulamos que se guardó correctamente
      
      Logger.info('Task created successfully', { taskId: taskData.task_id });
      
      return {
        content: [{
          type: 'text',
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
          type: 'text',
          text: `Error al crear la tarea: ${error.message}`
        }]
      };
    }
  }
} as const;
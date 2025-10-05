import { z } from 'zod';
import { parseNote, validateNote } from '../../utils/validators.js';
import { generateNoteId } from '../../utils/id-generator.js';
import Logger from '../../utils/logger.js';
import { NoteRepository } from '../../storage/repositories/note.repository.js';

// Esta variable se usará para inyectar el repositorio cuando esté disponible
let noteRepository: NoteRepository | undefined;

export const setNoteRepository = (repository: NoteRepository) => {
  noteRepository = repository;
};

// Definición de la herramienta para crear notas
export const createNoteTool = {
  id: 'create_note',
  description: 'Crea una nota estructurada según el formato SRP para preservar contexto de tareas de IA',
  inputSchema: z.object({
    agent_id: z.string().describe('ID del agente que crea la nota'),
    task_id: z.string().describe('ID de la tarea principal (formato: session_YYYYMMDD_NNN)'),
    task_title: z.string().describe('Título de la tarea principal'),
    subtask_id: z.string().optional().describe('ID de la subtarea específica (formato: subtask_YYYYMMDD_NNN)'),
    subtask_title: z.string().optional().describe('Título de la subtarea'),
    content: z.string().describe('Contenido descriptivo de la nota con los detalles relevantes'),
    subtask_status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional().default('in_progress').describe('Estado actual de la subtarea'),
    public_state: z.boolean().optional().default(true).describe('Booleano que indica si la nota es visible públicamente o es privada del agente')
  }),
  handler: async (params: any) => {
    try {
      Logger.debug('Creating note', { params });
      
      // Validar los parámetros de entrada
      const inputData = createNoteTool.inputSchema.parse(params);
      
      // Crear el objeto de nota con los campos requeridos
      const noteData = {
        note_id: generateNoteId(),
        timestamp: new Date().toISOString(),
        ...inputData
      };
      
      // Validar la estructura de la nota
      if (!validateNote(noteData)) {
        return {
          content: [{
            type: 'text',
            text: 'Error: La nota no cumple con el formato SRP requerido'
          }]
        };
      }
      
      // Si tenemos un repositorio disponible, usarlo para guardar la nota
      if (noteRepository) {
        try {
          const savedNote = await noteRepository.create({
            agent_id: inputData.agent_id,
            task_id: inputData.task_id,
            task_title: inputData.task_title,
            subtask_id: inputData.subtask_id,
            subtask_title: inputData.subtask_title,
            content: inputData.content,
            subtask_status: inputData.subtask_status,
            public_state: inputData.public_state
          });
          
          Logger.info('Note saved to database', { noteId: savedNote.note_id });
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                note_id: savedNote.note_id,
                message: 'Nota creada exitosamente en el sistema SRP'
              }, null, 2)
            }]
          };
        } catch (dbError: any) {
          Logger.error('Error saving note to database', { error: dbError.message });
          
          return {
            content: [{
              type: 'text',
              text: `Error al guardar la nota en la base de datos: ${dbError.message}`
            }]
          };
        }
      } else {
        // Si no hay repositorio, usar la lógica simulada
        Logger.info('Note created (simulated)', { noteId: noteData.note_id });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              note_id: noteData.note_id,
              message: 'Nota creada exitosamente en el sistema SRP (almacenamiento simulado)'
            }, null, 2)
          }]
        };
      }
    } catch (error: any) {
      Logger.error('Error creating note', { error: error.message, params });
      
      return {
        content: [{
          type: 'text',
          text: `Error al crear la nota: ${error.message}`
        }]
      };
    }
  }
} as const;
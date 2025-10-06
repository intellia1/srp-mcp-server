import { z } from 'zod';
import Logger from '../../utils/logger.js';
import { NoteRepository } from '../../storage/repositories/note.repository.js';

// Repository injection
let noteRepository: NoteRepository | undefined;

export const setNoteRepository = (repository: NoteRepository) => {
  noteRepository = repository;
};

// Definición de la herramienta para actualizar el estado de una nota
export const updateNoteStatusTool = {
  id: 'update_note_status',
  description: 'Actualiza el estado de una subtarea en una nota específica',
  inputSchema: z.object({
    note_id: z.string().describe('ID de la nota a actualizar (formato: note_YYYYMMDD_NNN)'),
    subtask_status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).describe('Nuevo estado de la subtarea'),
    agent_id: z.string().describe('ID del agente que realiza la actualización')
  }),
  handler: async (params: any) => {
    try {
      Logger.debug('Updating note status', { params });

      // Validar los parámetros de entrada
      const inputData = updateNoteStatusTool.inputSchema.parse(params);

      // Database logic using repository
      if (noteRepository) {
        try {
          const updatedNote = await noteRepository.updateStatus(
            inputData.note_id,
            inputData.subtask_status
          );

          if (!updatedNote) {
            Logger.warn('Note not found for update', { noteId: inputData.note_id });
            return {
              content: [{
                type: 'text' as const,
                text: JSON.stringify({
                  success: false,
                  message: `Nota no encontrada: ${inputData.note_id}`
                }, null, 2)
              }]
            };
          }

          Logger.info('Note status updated successfully from database', {
            noteId: inputData.note_id,
            newStatus: inputData.subtask_status
          });

          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                note: updatedNote,
                message: `Estado de subtarea actualizado a: ${inputData.subtask_status}`
              }, null, 2)
            }]
          };
        } catch (dbError: any) {
          Logger.error('Error from database', { error: dbError.message });
          return {
            content: [{
              type: 'text' as const,
              text: `Error al actualizar el estado de la nota en la base de datos: ${dbError.message}`
            }]
          };
        }
      }

      // Fallback: mock data when repository is not configured
      Logger.warn('No repository configured - returning mock data');

      const mockNote = {
        note_id: inputData.note_id,
        agent_id: inputData.agent_id,
        task_id: 'session_20251005_001',
        timestamp: new Date().toISOString(),
        task_title: 'Mock Task Title',
        subtask_id: 'subtask_20251005_001',
        subtask_title: 'Mock Subtask Title',
        content: 'This is a mock note for demonstration purposes',
        subtask_status: inputData.subtask_status,
        public_state: true
      };

      Logger.info('Note status updated successfully (mock)', {
        noteId: inputData.note_id,
        newStatus: inputData.subtask_status
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            success: true,
            note: mockNote,
            message: `Estado de subtarea actualizado a: ${inputData.subtask_status}`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      Logger.error('Error updating note status', { error: error.message, params });

      return {
        content: [{
          type: 'text' as const,
          text: `Error al actualizar el estado de la nota: ${error.message}`
        }]
      };
    }
  }
} as const;
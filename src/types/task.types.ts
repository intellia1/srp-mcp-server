import { z } from 'zod';
import { NoteSchema } from './note.types';

// Schema para la estructura de tareas
export const TaskSchema = z.object({
  task_id: z.string().regex(/^session_\d{8}_\d{3}$/), // Formato: session_YYYYMMDD_NNN
  agent_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).default('pending'),
  notes: z.array(NoteSchema).optional().default([])
});

export type Task = z.infer<typeof TaskSchema>;
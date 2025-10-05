import { z } from 'zod';

// Schema para la estructura de notas según SRP
export const NoteSchema = z.object({
  note_id: z.string().regex(/^note_\d{8}_\d{3}$/), // Formato: note_YYYYMMDD_NNN
  agent_id: z.string(),
  task_id: z.string().regex(/^session_\d{8}_\d{3}$/), // Formato: session_YYYYMMDD_NNN
  timestamp: z.string().datetime(),
  task_title: z.string(),
  subtask_id: z.string().regex(/^subtask_\d{8}_\d{3}$/).optional(), // Formato: subtask_YYYYMMDD_NNN
  subtask_title: z.string().optional(),
  content: z.string(),
  subtask_status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).default('pending'),
  public_state: z.boolean().default(true)
});

export type Note = z.infer<typeof NoteSchema>;

// Schema para la estructura de tareas
export const TaskSchema = z.object({
  task_id: z.string().regex(/^session_\d{8}_\d{3}$/),
  title: z.string(),
  description: z.string().optional(),
  notes: z.array(NoteSchema).optional().default([])
});

export type Task = z.infer<typeof TaskSchema>;
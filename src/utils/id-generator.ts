import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un ID de nota con el formato: note_YYYYMMDD_NNN
 */
export function generateNoteId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `note_${dateStr}_${randomNum}`;
}

/**
 * Genera un ID de tarea con el formato: session_YYYYMMDD_NNN
 */
export function generateTaskId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `session_${dateStr}_${randomNum}`;
}

/**
 * Genera un ID de subtarea con el formato: subtask_YYYYMMDD_NNN
 */
export function generateSubtaskId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `subtask_${dateStr}_${randomNum}`;
}

/**
 * Genera un UUID v4
 */
export function generateUUID(): string {
  return uuidv4();
}
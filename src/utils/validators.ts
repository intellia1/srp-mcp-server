import { z } from 'zod';
import { NoteSchema, TaskSchema } from '../types/note.types.js';

/**
 * Valida una nota estructurada según el formato SRP
 */
export function validateNote(note: unknown): boolean {
  try {
    NoteSchema.parse(note);
    return true;
  } catch (error) {
    console.error('Error de validación en nota:', error);
    return false;
  }
}

/**
 * Valida una tarea según el formato SRP
 */
export function validateTask(task: unknown): boolean {
  try {
    TaskSchema.parse(task);
    return true;
  } catch (error) {
    console.error('Error de validación en tarea:', error);
    return false;
  }
}

/**
 * Parsea y valida una nota, devolviendo el objeto validado o null si falla
 */
export function parseNote(note: unknown): z.infer<typeof NoteSchema> | null {
  try {
    return NoteSchema.parse(note);
  } catch (error) {
    console.error('Error de validación en parseo de nota:', error);
    return null;
  }
}

/**
 * Parsea y valida una tarea, devolviendo el objeto validado o null si falla
 */
export function parseTask(task: unknown): z.infer<typeof TaskSchema> | null {
  try {
    return TaskSchema.parse(task);
  } catch (error) {
    console.error('Error de validación en parseo de tarea:', error);
    return null;
  }
}
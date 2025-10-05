import { PrismaClient, Note as PrismaNote } from '@prisma/client';
import { Note } from '../types/note.types';
import Logger from '../utils/logger.js';

// Mapeo entre el tipo SRP y el modelo de Prisma
const mapPrismaNoteToNote = (prismaNote: PrismaNote): Note => {
  return {
    note_id: prismaNote.noteId,
    agent_id: prismaNote.agentId,
    task_id: prismaNote.taskId,
    subtask_id: prismaNote.subtaskId || undefined,
    timestamp: prismaNote.timestamp.toISOString(),
    task_title: prismaNote.taskTitle,
    subtask_title: prismaNote.subtaskTitle || undefined,
    content: prismaNote.content,
    subtask_status: prismaNote.subtaskStatus as Note['subtask_status'],
    public_state: prismaNote.publicState
  };
};

export interface NoteFilters {
  task_id?: string;
  agent_id?: string;
  subtask_id?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface NoteRepository {
  create(note: Omit<Note, 'note_id' | 'timestamp'> & { note_id?: string }): Promise<Note>;
  findById(noteId: string): Promise<Note | null>;
  findByTask(taskId: string, agentId?: string): Promise<Note[]>;
  search(filters: NoteFilters): Promise<Note[]>;
  updateStatus(noteId: string, status: Note['subtask_status']): Promise<Note | null>;
  update(noteId: string, note: Partial<Note>): Promise<Note | null>;
  delete(noteId: string): Promise<boolean>;
}

export class PrismaNoteRepository implements NoteRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(note: Omit<Note, 'note_id' | 'timestamp'> & { note_id?: string }): Promise<Note> {
    const noteId = note.note_id || `note_${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const timestamp = new Date();
    
    const prismaNote = await this.prisma.note.create({
      data: {
        noteId,
        agentId: note.agent_id,
        taskId: note.task_id,
        subtaskId: note.subtask_id,
        timestamp,
        taskTitle: note.task_title,
        subtaskTitle: note.subtask_title,
        content: note.content,
        subtaskStatus: note.subtask_status || 'pending',
        publicState: note.public_state ?? true,
        metadata: {}
      }
    });

    Logger.info('Note created in database', { noteId });

    return mapPrismaNoteToNote(prismaNote);
  }

  async findById(noteId: string): Promise<Note | null> {
    const prismaNote = await this.prisma.note.findUnique({
      where: { noteId }
    });

    if (!prismaNote) {
      return null;
    }

    return mapPrismaNoteToNote(prismaNote);
  }

  async findByTask(taskId: string, agentId?: string): Promise<Note[]> {
    const whereClause: any = { taskId };
    if (agentId) {
      whereClause.agentId = agentId;
    }

    const prismaNotes = await this.prisma.note.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' }
    });

    return prismaNotes.map(mapPrismaNoteToNote);
  }

  async search(filters: NoteFilters): Promise<Note[]> {
    const whereClause: any = {};
    
    if (filters.task_id) {
      whereClause.taskId = filters.task_id;
    }
    
    if (filters.agent_id) {
      whereClause.agentId = filters.agent_id;
    }
    
    if (filters.subtask_id) {
      whereClause.subtaskId = filters.subtask_id;
    }
    
    if (filters.query) {
      whereClause.content = {
        contains: filters.query,
        mode: 'insensitive'
      };
    }

    const prismaNotes = await this.prisma.note.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: filters.limit,
      skip: filters.offset
    });

    return prismaNotes.map(mapPrismaNoteToNote);
  }

  async updateStatus(noteId: string, status: Note['subtask_status']): Promise<Note | null> {
    try {
      const prismaNote = await this.prisma.note.update({
        where: { noteId },
        data: { subtaskStatus: status }
      });

      Logger.info('Note status updated', { noteId, status });

      return mapPrismaNoteToNote(prismaNote);
    } catch (error: any) {
      if (error.code === 'P2025') { // Record not found
        Logger.warn('Note not found for status update', { noteId });
        return null;
      }
      throw error;
    }
  }

  async update(noteId: string, note: Partial<Note>): Promise<Note | null> {
    try {
      const updateData: any = {};
      if (note.agent_id) updateData.agentId = note.agent_id;
      if (note.task_id) updateData.taskId = note.task_id;
      if ('subtask_id' in note) updateData.subtaskId = note.subtask_id;
      if (note.task_title) updateData.taskTitle = note.task_title;
      if ('subtask_title' in note) updateData.subtaskTitle = note.subtask_title;
      if (note.content) updateData.content = note.content;
      if (note.subtask_status) updateData.subtaskStatus = note.subtask_status;
      if ('public_state' in note) updateData.publicState = note.public_state;

      const prismaNote = await this.prisma.note.update({
        where: { noteId },
        data: updateData
      });

      Logger.info('Note updated', { noteId });

      return mapPrismaNoteToNote(prismaNote);
    } catch (error: any) {
      if (error.code === 'P2025') { // Record not found
        Logger.warn('Note not found for update', { noteId });
        return null;
      }
      throw error;
    }
  }

  async delete(noteId: string): Promise<boolean> {
    try {
      await this.prisma.note.delete({
        where: { noteId }
      });

      Logger.info('Note deleted', { noteId });

      return true;
    } catch (error: any) {
      if (error.code === 'P2025') { // Record not found
        Logger.warn('Note not found for deletion', { noteId });
        return false;
      }
      throw error;
    }
  }
}
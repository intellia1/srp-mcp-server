import { PrismaClient, Task as PrismaTask } from '@prisma/client';
import { Task } from '../types/task.types';
import Logger from '../utils/logger.js';

// Mapeo entre el tipo SRP y el modelo de Prisma
const mapPrismaTaskToTask = (prismaTask: PrismaTask): Task => {
  return {
    task_id: prismaTask.taskId,
    agent_id: prismaTask.agentId,
    title: prismaTask.title,
    description: prismaTask.description || undefined,
    created_at: prismaTask.createdAt.toISOString(),
    updated_at: prismaTask.updatedAt.toISOString(),
    status: prismaTask.status as Task['status']
  };
};

export interface TaskFilters {
  agent_id?: string;
  status?: Task['status'];
  limit?: number;
  offset?: number;
}

export interface TaskRepository {
  create(task: Omit<Task, 'task_id' | 'created_at' | 'updated_at'> & { task_id?: string }): Promise<Task>;
  findById(taskId: string, agentId?: string): Promise<Task | null>;
  findByAgent(agentId: string, filters?: { status?: Task['status'] }): Promise<Task[]>;
  search(filters: TaskFilters): Promise<Task[]>;
  update(taskId: string, task: Partial<Task>): Promise<Task | null>;
  updateStatus(taskId: string, status: Task['status']): Promise<Task | null>;
  delete(taskId: string): Promise<boolean>;
}

export class PrismaTaskRepository implements TaskRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(task: Omit<Task, 'task_id' | 'created_at' | 'updated_at'> & { task_id?: string }): Promise<Task> {
    const taskId = task.task_id || `session_${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const prismaTask = await this.prisma.task.create({
      data: {
        taskId,
        agentId: task.agent_id,
        title: task.title,
        description: task.description,
        status: task.status || 'pending'
      }
    });

    Logger.info('Task created in database', { taskId });

    return mapPrismaTaskToTask(prismaTask);
  }

  async findById(taskId: string, agentId?: string): Promise<Task | null> {
    const whereClause: any = { taskId };
    if (agentId) {
      whereClause.agentId = agentId;
    }

    const prismaTask = await this.prisma.task.findUnique({
      where: whereClause
    });

    if (!prismaTask) {
      return null;
    }

    return mapPrismaTaskToTask(prismaTask);
  }

  async findByAgent(agentId: string, filters?: { status?: Task['status'] }): Promise<Task[]> {
    const whereClause: any = { agentId };
    if (filters?.status) {
      whereClause.status = filters.status;
    }

    const prismaTasks = await this.prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return prismaTasks.map(mapPrismaTaskToTask);
  }

  async search(filters: TaskFilters): Promise<Task[]> {
    const whereClause: any = {};
    
    if (filters.agent_id) {
      whereClause.agentId = filters.agent_id;
    }
    
    if (filters.status) {
      whereClause.status = filters.status;
    }

    const prismaTasks = await this.prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: filters.limit,
      skip: filters.offset
    });

    return prismaTasks.map(mapPrismaTaskToTask);
  }

  async update(taskId: string, task: Partial<Task>): Promise<Task | null> {
    try {
      const updateData: any = {};
      if (task.agent_id) updateData.agentId = task.agent_id;
      if (task.title) updateData.title = task.title;
      if ('description' in task) updateData.description = task.description;
      if (task.status) updateData.status = task.status;

      const prismaTask = await this.prisma.task.update({
        where: { taskId },
        data: updateData
      });

      Logger.info('Task updated', { taskId });

      return mapPrismaTaskToTask(prismaTask);
    } catch (error: any) {
      if (error.code === 'P2025') { // Record not found
        Logger.warn('Task not found for update', { taskId });
        return null;
      }
      throw error;
    }
  }

  async updateStatus(taskId: string, status: Task['status']): Promise<Task | null> {
    try {
      const prismaTask = await this.prisma.task.update({
        where: { taskId },
        data: { status }
      });

      Logger.info('Task status updated', { taskId, status });

      return mapPrismaTaskToTask(prismaTask);
    } catch (error: any) {
      if (error.code === 'P2025') { // Record not found
        Logger.warn('Task not found for status update', { taskId });
        return null;
      }
      throw error;
    }
  }

  async delete(taskId: string): Promise<boolean> {
    try {
      await this.prisma.task.delete({
        where: { taskId }
      });

      Logger.info('Task deleted', { taskId });

      return true;
    } catch (error: any) {
      if (error.code === 'P2025') { // Record not found
        Logger.warn('Task not found for deletion', { taskId });
        return false;
      }
      throw error;
    }
  }
}
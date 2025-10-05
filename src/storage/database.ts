import { PrismaClient } from '@prisma/client';
import Logger from '../utils/logger.js';

export interface DatabaseConfig {
  url: string;
}

export class DatabaseService {
  private prisma: PrismaClient;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.config.url
        }
      }
    });
  }

  async initialize(): Promise<void> {
    try {
      // Probar la conexión
      await this.prisma.$connect();
      Logger.info('Database connected successfully', { 
        url: this.config.url.replace(/:.*@/, ':***@') // Ocultar contraseña en logs
      });
    } catch (error) {
      Logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
    Logger.info('Database connection closed');
  }
}

export default DatabaseService;
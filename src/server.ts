import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Logger from './utils/logger.js';
import { registerTools } from './tools/index.js';
import DatabaseService from './storage/database.js';
import { PrismaNoteRepository } from './storage/repositories/note.repository.js';
import { PrismaTaskRepository } from './storage/repositories/task.repository.js';

export interface ServerConfig {
  name?: string;
  version?: string;
  transport?: 'stdio' | 'http';
  database?: {
    url: string;
  };
}

export class SrpMcpServer {
  private server: McpServer;
  private config: ServerConfig;
  private databaseService?: DatabaseService;

  constructor(config: ServerConfig = {}) {
    this.config = {
      name: 'SRP-MCP Server',
      version: '1.0.0',
      database: {
        url: process.env.DATABASE_URL || 'postgresql://srp_mcp_user:srp_mcp_password@localhost:5432/srp_mcp_db'
      },
      ...config
    };

    this.server = new McpServer({
      name: this.config.name!,
      version: this.config.version!
    });

    Logger.info('SRP-MCP Server initialized', { config: this.config });
  }

  async start(): Promise<void> {
    try {
      // Inicializar la base de datos
      if (this.config.database) {
        this.databaseService = new DatabaseService(this.config.database);
        await this.databaseService.initialize();
        
        // Pasar instancias de repositorios a las herramientas
        const prisma = this.databaseService.getClient();
        const noteRepository = new PrismaNoteRepository(prisma);
        const taskRepository = new PrismaTaskRepository(prisma);
        
        // Registrar todas las herramientas con acceso a los repositorios
        registerTools(this.server, { noteRepository, taskRepository });
      } else {
        // Registrar herramientas sin persistencia (solo para pruebas)
        registerTools(this.server);
      }
      
      // Conectar el transporte
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      Logger.info('SRP-MCP Server started and connected to transport');
    } catch (error) {
      Logger.error('Failed to start SRP-MCP Server', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.databaseService) {
      await this.databaseService.close();
      Logger.info('SRP-MCP Server database connection closed');
    }
  }
}

export default SrpMcpServer;
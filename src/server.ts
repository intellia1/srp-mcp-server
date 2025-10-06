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
        Logger.info('Initializing database connection...', {
          url: this.config.database.url.replace(/:[^:@]*@/, ':***@')
        });

        this.databaseService = new DatabaseService(this.config.database);
        await this.databaseService.initialize();

        Logger.info('Database connection established successfully');

        // Pasar instancias de repositorios a las herramientas
        const prisma = this.databaseService.getClient();
        const noteRepository = new PrismaNoteRepository(prisma);
        const taskRepository = new PrismaTaskRepository(prisma);

        // Registrar todas las herramientas con acceso a los repositorios
        registerTools(this.server, { noteRepository, taskRepository });
        Logger.info('All tools registered with database repositories');
      } else {
        // Registrar herramientas sin persistencia (solo para pruebas)
        Logger.warn('Starting without database - tools will not persist data');
        registerTools(this.server);
      }

      // Conectar el transporte
      Logger.info('Connecting to stdio transport...');
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      Logger.info('SRP-MCP Server started and connected to transport successfully');
    } catch (error) {
      Logger.error('Failed to start SRP-MCP Server', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
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
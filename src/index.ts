#!/usr/bin/env node

import SrpMcpServer from './server.js';
import Logger from './utils/logger.js';

async function main(): Promise<void> {
  try {
    const server = new SrpMcpServer();
    await server.start();
    
    // Mantener el proceso vivo
    process.on('SIGINT', async () => {
      Logger.info('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      Logger.info('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
  } catch (error) {
    Logger.error('Failed to start SRP-MCP Server', { error });
    process.exit(1);
  }
}

// Solo ejecutar main si este archivo es el módulo principal
if (require.main === module) {
  main();
}

export default main;
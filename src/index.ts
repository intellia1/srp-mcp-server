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
// En ES modules, usamos import.meta.url
// Para Windows, necesitamos normalizar las rutas
const isMainModule = () => {
  const scriptPath = process.argv[1];
  if (!scriptPath) return false;

  // Normalizar ambas rutas a formato URL
  const normalizedArgv = scriptPath.replace(/\\/g, '/');
  const normalizedMeta = import.meta.url.replace(/\\/g, '/');

  return normalizedMeta.endsWith(normalizedArgv) ||
         normalizedMeta === `file:///${normalizedArgv}` ||
         normalizedMeta === `file://${normalizedArgv}`;
};

if (isMainModule()) {
  main();
}

export default main;
import type { Logger, DatabaseConfig, Runner } from "../types.ts";

// - Implementaciones concretas de Logger por entorno

class DevLogger implements Logger {
  log(message: string): void {
    console.log(`[DEV LOG] ${message}`);
  }
  error(message: string): void {
    console.error(`[DEV ERROR] ${message}`);
  }
}

class StagingLogger implements Logger {
  log(message: string): void {
    console.log(`[STAGING LOG] ${new Date().toISOString()} - ${message}`);
  }
  error(message: string): void {
    console.error(`[STAGING ERROR] ${new Date().toISOString()} - ${message}`);
  }
}

class ProdLogger implements Logger {
  log(message: string): void {
    console.log(`[PROD LOG] ${new Date().toISOString()} | ${message}`);
  }
  error(message: string): void {
    console.error(`[PROD CRITICAL] ${new Date().toISOString()} | ${message}`);
  }
}

// - Implementaciones concretas de Runner por entorno
// NOTE: En un proyecto real estos runners ejecutarían scripts reales via shell.
// Aquí se simulan para mantener el foco en los patrones, no en la infraestructura.

class DevRunner implements Runner {
  run(script: string): void {
    console.log(`[DEV] Simulando ejecución: ${script}`);
  }
}

class StagingRunner implements Runner {
  run(script: string): void {
    console.log(`[STAGING] Ejecutando con validaciones extra: ${script}`);
  }
}

class ProdRunner implements Runner {
  run(script: string): void {
    console.log(`[PROD] Ejecutando con permisos elevados: ${script}`);
  }
}

// - Configuraciones de base de datos por entorno

const devDb: DatabaseConfig = { host: "localhost", port: 5432, name: "app_dev" };
const stagingDb: DatabaseConfig = { host: "staging.db.internal", port: 5432, name: "app_staging" };
const prodDb: DatabaseConfig = { host: "prod.db.internal", port: 5432, name: "app_prod" };

export { DevLogger, StagingLogger, ProdLogger };
export { DevRunner, StagingRunner, ProdRunner };
export { devDb, stagingDb, prodDb };
import type { EnvironmentFactory, Logger, DatabaseConfig, Runner } from "../types.ts";
import { Environment } from "../types.ts";
import {
  DevLogger, StagingLogger, ProdLogger,
  DevRunner, StagingRunner, ProdRunner,
  devDb, stagingDb, prodDb
} from "./environment.config.ts";

// - Abstract Factory: cada clase concreta produce una familia coherente de objetos.
// El cliente nunca instancia DevLogger o ProdRunner directamente, solo conoce
// EnvironmentFactory. Cambiar de entorno no requiere tocar ningún otro archivo.
//
// NOTE: Aquí NO se usó Singleton para el entorno activo aunque podría parecer
// tentador. Un Singleton introduciría estado global que haría imposible testear
// dos entornos en paralelo y acoplaría todo el sistema a una instancia única.
// La fábrica se instancia una vez en main.ts y se pasa por parámetro: suficiente.

class DevEnvironmentFactory implements EnvironmentFactory {
  createLogger(): Logger { return new DevLogger(); }
  createDatabaseConfig(): DatabaseConfig { return devDb; }
  createRunner(): Runner { return new DevRunner(); }
}

class StagingEnvironmentFactory implements EnvironmentFactory {
  createLogger(): Logger { return new StagingLogger(); }
  createDatabaseConfig(): DatabaseConfig { return stagingDb; }
  createRunner(): Runner { return new StagingRunner(); }
}

class ProdEnvironmentFactory implements EnvironmentFactory {
  createLogger(): Logger { return new ProdLogger(); }
  createDatabaseConfig(): DatabaseConfig { return prodDb; }
  createRunner(): Runner { return new ProdRunner(); }
}

function resolveFactory(env: Environment): EnvironmentFactory {
  const factories: Record<Environment, EnvironmentFactory> = {
    dev: new DevEnvironmentFactory(),
    staging: new StagingEnvironmentFactory(),
    prod: new ProdEnvironmentFactory(),
  };
  return factories[env];
}

export { resolveFactory };
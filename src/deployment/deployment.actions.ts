import type { DeployAction, DeploymentNotifier } from "../types.ts";
import type { Runner, Logger } from "../types.ts";

// - Command: cada acción del deployment se encapsula como un objeto independiente.
// El invocador (executor) no sabe qué hace cada acción, solo llama execute() o undo().
// Esto habilita historial, rollback ordenado, y extensión sin modificar el pipeline.
//
// NOTE: El historial de acciones ejecutadas NO usa Builder aunque manejar una
// lista con múltiples pasos podría sugerirlo. Builder resuelve construcción de
// objetos complejos con muchos parámetros opcionales, no acumulación de ejecuciones.
// Un simple array con push/pop es suficiente y más legible aquí.

class BuildAction implements DeployAction {
  constructor(private runner: Runner, private logger: Logger) {}

  execute(): void {
    this.logger.log("Ejecutando build de la aplicación...");
    this.runner.run("build.sh");
  }

  undo(): void {
    this.logger.log("Revirtiendo build: limpiando artefactos...");
    this.runner.run("clean.sh");
  }

  describe(): string { return "BuildAction"; }
}

class MigrateAction implements DeployAction {
  constructor(private runner: Runner, private logger: Logger) {}

  execute(): void {
    this.logger.log("Ejecutando migraciones de base de datos...");
    this.runner.run("migrate.sh");
  }

  undo(): void {
    this.logger.log("Revirtiendo migraciones...");
    this.runner.run("migrate-rollback.sh");
  }

  describe(): string { return "MigrateAction"; }
}

class PublishAction implements DeployAction {
  constructor(private runner: Runner, private logger: Logger) {}

  execute(): void {
    this.logger.log("Publicando artefactos al servidor destino...");
    this.runner.run("publish.sh");
  }

  undo(): void {
    this.logger.log("Revirtiendo publicación: restaurando versión anterior...");
    this.runner.run("rollback-publish.sh");
  }

  describe(): string { return "PublishAction"; }
}

class HealthCheckAction implements DeployAction {
  constructor(private runner: Runner, private logger: Logger) {}

  execute(): void {
    this.logger.log("Verificando salud del servicio desplegado...");
    this.runner.run("healthcheck.sh");
  }

  undo(): void {
    this.logger.log("Health check no tiene rollback, omitiendo...");
  }

  describe(): string { return "HealthCheckAction"; }
}

export { BuildAction, MigrateAction, PublishAction, HealthCheckAction };
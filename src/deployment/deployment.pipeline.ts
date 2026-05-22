import type { DeployAction, DeploymentNotifier, ExecutionStrategy } from "../types.ts";
import type { Logger } from "../types.ts";

// - Template Method: define el esqueleto fijo del proceso de deployment.
// Los pasos validate, prepare, execute y rollback siempre ocurren en ese orden.
// Las subclases concretas definen qué significa cada paso para su tipo de deploy.
//
// NOTE: Chain of Responsibility podría parecer similar porque también encadena
// pasos secuenciales. Pero CoR está diseñado para que cada eslabón decida si
// maneja o pasa la solicitud al siguiente, es decir, flujo condicional con corte.
// Aquí todos los pasos siempre se ejecutan en orden fijo sin condición de corte,
// lo que es exactamente el problema que resuelve Template Method.

abstract class DeploymentPipeline {
  private executedActions: DeployAction[] = [];

  constructor(
    protected actions: DeployAction[],
    protected strategy: ExecutionStrategy,
    protected notifier: DeploymentNotifier,
    protected logger: Logger,
  ) {}

  // - Esqueleto del algoritmo: no se sobreescribe en subclases
  deploy(): void {
    this.notifier.notify("PIPELINE", "Iniciando pipeline de deployment");
    try {
      this.validate();
      this.prepare();
      this.execute();
      this.notifier.notify("PIPELINE", "Deployment completado exitosamente");
    } catch (error) {
      this.logger.error(`Fallo en pipeline: ${error}`);
      this.rollback();
    }
  }

  protected abstract validate(): void;
  protected abstract prepare(): void;

  // - execute delega en Strategy: el pipeline no sabe cómo se ejecuta
  protected execute(): void {
    this.executedActions = this.actions;
    this.strategy.run(this.actions, this.notifier);
  }

  protected rollback(): void {
    this.notifier.notify("ROLLBACK", "Iniciando rollback de acciones ejecutadas");
    for (const action of [...this.executedActions].reverse()) {
      this.logger.log(`Revirtiendo: ${action.describe()}`);
      action.undo();
    }
  }
}

// - Implementaciones concretas del pipeline

class StandardDeployment extends DeploymentPipeline {
  protected validate(): void {
    this.notifier.notify("VALIDATE", "Validando configuración y permisos...");
    this.logger.log("Validaciones estándar completadas");
  }

  protected prepare(): void {
    this.notifier.notify("PREPARE", "Preparando artefactos de build...");
    this.logger.log("Preparación estándar completada");
  }
}

class HotfixDeployment extends DeploymentPipeline {
  protected validate(): void {
    this.notifier.notify("VALIDATE", "Validación express para hotfix...");
    this.logger.log("Validación mínima para hotfix completada");
  }

  protected prepare(): void {
    this.notifier.notify("PREPARE", "Preparación acelerada para hotfix...");
    this.logger.log("Preparación de hotfix completada");
  }
}

export { StandardDeployment, HotfixDeployment };
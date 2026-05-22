export type Environment = "dev" | "staging" | "prod";
export type DeployStrategy = "direct" | "rolling" | "blue-green";

// ── Familia de objetos que varía por entorno ──────────────────────────────────
export interface Logger {
  log(message: string): void;
  error(message: string): void;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
}

export interface Runner {
  run(script: string): void;
}

// ── Contrato de la fábrica de entorno (Abstract Factory) ──────────────────────
export interface EnvironmentFactory {
  createLogger(): Logger;
  createDatabaseConfig(): DatabaseConfig;
  createRunner(): Runner;
}

// ── Contrato de cada acción encapsulada (Command) ─────────────────────────────
export interface DeployAction {
  execute(): void;
  undo(): void;
  describe(): string;
}

// ── Contrato base para decorar acciones (Decorator) ───────────────────────────
export abstract class ActionWrapper implements DeployAction {
  constructor(protected wrapped: DeployAction) {}
  execute(): void { this.wrapped.execute(); }
  undo(): void { this.wrapped.undo(); }
  describe(): string { return this.wrapped.describe(); }
}

// ── Contrato del algoritmo de ejecución (Strategy) ───────────────────────────
export interface ExecutionStrategy {
  run(actions: DeployAction[], notifier: DeploymentNotifier): void;
}

// ── Contratos del sistema de notificaciones (Observer) ────────────────────────
export interface DeploymentListener {
  onPhaseChange(phase: string, detail: string): void;
}

export interface DeploymentNotifier {
  subscribe(listener: DeploymentListener): void;
  notify(phase: string, detail: string): void;
}
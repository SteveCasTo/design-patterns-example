import type { DeploymentListener, DeploymentNotifier } from "../types.ts";

// - Observer: el notifier mantiene una lista de listeners suscritos.
// Cada vez que una fase cambia, notifica a todos sin saber quiénes son.
// Añadir un nuevo listener (por ejemplo, un webhook) no requiere tocar
// el pipeline ni las acciones, solo suscribirse aquí.
//
// NOTE: No se usó EventEmitter de Node porque introduce una dependencia
// externa y oculta el contrato del patrón. Implementarlo explícitamente
// deja claro qué problema resuelve Observer en este contexto.

class DeploymentEventNotifier implements DeploymentNotifier {
  private listeners: DeploymentListener[] = [];

  subscribe(listener: DeploymentListener): void {
    this.listeners.push(listener);
  }

  notify(phase: string, detail: string): void {
    for (const listener of this.listeners) {
      listener.onPhaseChange(phase, detail);
    }
  }
}

// - Listeners concretos

class ConsoleListener implements DeploymentListener {
  onPhaseChange(phase: string, detail: string): void {
    console.log(`[OBSERVER - ConsoleListener] Fase: ${phase} | ${detail}`);
  }
}

class AuditListener implements DeploymentListener {
  private log: string[] = [];

  onPhaseChange(phase: string, detail: string): void {
    const entry = `${new Date().toISOString()} | ${phase}: ${detail}`;
    this.log.push(entry);
    console.log(`[OBSERVER - AuditListener] Registrado: ${entry}`);
  }

  getLog(): string[] { return this.log; }
}

export { DeploymentEventNotifier, ConsoleListener, AuditListener };
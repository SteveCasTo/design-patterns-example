import { ActionWrapper } from "../types.ts";
import type { DeployAction } from "../types.ts";

// - Decorator: añade comportamiento transversal a las acciones sin modificarlas.
// RetryWrapper y TimingWrapper envuelven cualquier DeployAction existente.
// Se pueden combinar: new TimingWrapper(new RetryWrapper(action)) sin tocar
// BuildAction, MigrateAction ni ninguna acción concreta.
//
// NOTE: Herencia no resuelve esto limpiamente. Si usáramos herencia necesitaríamos
// TimedBuildAction, RetryBuildAction, TimedRetryBuildAction, TimedMigrateAction, etc.
// Eso es explosión de subclases, exactamente el problema que Decorator evita.

class RetryWrapper extends ActionWrapper {
  constructor(wrapped: DeployAction, private maxRetries: number = 2) {
    super(wrapped);
  }

  execute(): void {
    let attempts = 0;
    while (attempts <= this.maxRetries) {
      try {
        console.log(`[DECORATOR - RetryWrapper] Intento ${attempts + 1} para ${this.describe()}`);
        this.wrapped.execute();
        return;
      } catch {
        attempts++;
        if (attempts > this.maxRetries) {
          console.error(`[DECORATOR - RetryWrapper] Agotados los reintentos para ${this.describe()}`);
          throw new Error(`Falló después de ${this.maxRetries + 1} intentos`);
        }
      }
    }
  }
}

class TimingWrapper extends ActionWrapper {
  execute(): void {
    const start = performance.now();
    this.wrapped.execute();
    const elapsed = (performance.now() - start).toFixed(2);
    console.log(`[DECORATOR - TimingWrapper] ${this.describe()} completado en ${elapsed}ms`);
  }
}

export { RetryWrapper, TimingWrapper };
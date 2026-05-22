import type { ExecutionStrategy, DeployAction, DeploymentNotifier } from "../types.ts";

// - Strategy: cada clase implementa un algoritmo distinto de ejecución.
// El pipeline no sabe cómo se ejecutan las acciones, solo delega en la estrategia.
// Cambiar de direct a rolling no requiere tocar el pipeline ni las acciones.
//
// NOTE: No se usó Template Method aquí aunque los tres algoritmos comparten
// cierta estructura. Template Method resuelve un esqueleto fijo con pasos
// variables via herencia. Strategy resuelve algoritmos completamente
// intercambiables via composición. Como la lógica de cada estrategia es
// suficientemente distinta y se elige en runtime, Strategy es más apropiado.

class DirectStrategy implements ExecutionStrategy {
  run(actions: DeployAction[], notifier: DeploymentNotifier): void {
    notifier.notify("STRATEGY", "Ejecutando estrategia: Direct");
    for (const action of actions) {
      notifier.notify("ACTION", `Iniciando ${action.describe()}`);
      action.execute();
    }
  }
}

class RollingStrategy implements ExecutionStrategy {
  run(actions: DeployAction[], notifier: DeploymentNotifier): void {
    notifier.notify("STRATEGY", "Ejecutando estrategia: Rolling (3 instancias)");
    const instances = 3;
    for (let i = 1; i <= instances; i++) {
      notifier.notify("ROLLING", `Desplegando instancia ${i} de ${instances}`);
      for (const action of actions) {
        notifier.notify("ACTION", `[Instancia ${i}] ${action.describe()}`);
        action.execute();
      }
    }
  }
}

class BlueGreenStrategy implements ExecutionStrategy {
  run(actions: DeployAction[], notifier: DeploymentNotifier): void {
    notifier.notify("STRATEGY", "Ejecutando estrategia: Blue-Green");
    notifier.notify("BLUE-GREEN", "Preparando entorno Green (inactivo)...");
    for (const action of actions) {
      notifier.notify("ACTION", `[Green] ${action.describe()}`);
      action.execute();
    }
    notifier.notify("BLUE-GREEN", "Redirigiendo tráfico de Blue a Green...");
    notifier.notify("BLUE-GREEN", "Deployment completado. Green es ahora el entorno activo.");
  }
}

function resolveStrategy(strategy: string): ExecutionStrategy {
  const strategies: Record<string, ExecutionStrategy> = {
    direct: new DirectStrategy(),
    rolling: new RollingStrategy(),
    "blue-green": new BlueGreenStrategy(),
  };
  return strategies[strategy] ?? new DirectStrategy();
}

export { resolveStrategy };
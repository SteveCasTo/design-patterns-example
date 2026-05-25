import { resolveFactory } from "./environment/environment.factory.ts";
import { BuildAction, MigrateAction, PublishAction, HealthCheckAction } from "./deployment/deployment.actions.ts";
import { DeploymentEventNotifier, ConsoleListener, AuditListener } from "./deployment/deployment.notifier.ts";
import { resolveStrategy } from "./deployment/deployment.executor.ts";
import { StandardDeployment, HotfixDeployment } from "./deployment/deployment.pipeline.ts";
import { RetryWrapper, TimingWrapper } from "./shared/action.wrappers.ts";
import type { Environment, DeployStrategy } from "./types.ts";

// - Punto de entrada del CLI
// Uso: bun run src/main.ts <entorno> <estrategia> [hotfix]
// Ejemplo: bun run src/main.ts prod blue-green
//          bun run src/main.ts dev direct hotfix
// @ts-ignore
const [,, envArg = "dev", strategyArg = "direct", modeArg] = process.argv;

const env = envArg as Environment;
const strategy = strategyArg as DeployStrategy;
const isHotfix = modeArg === "hotfix";

// - Abstract Factory resuelve la familia de objetos correcta para el entorno
const factory = resolveFactory(env);
const logger = factory.createLogger();
const db = factory.createDatabaseConfig();
const runner = factory.createRunner();

logger.log(`Entorno: ${env} | DB: ${db.host}:${db.port}/${db.name}`);

// - Observer: se suscriben los listeners antes de que el pipeline arranque
const notifier = new DeploymentEventNotifier();
notifier.subscribe(new ConsoleListener());
const audit = new AuditListener();
notifier.subscribe(audit);

// - Command: acciones base del deployment
const rawActions = [
  new BuildAction(runner, logger),
  new MigrateAction(runner, logger),
  new PublishAction(runner, logger),
  new HealthCheckAction(runner, logger),
];

// - Decorator: se envuelven las acciones críticas con retry y timing
// NOTE: No todas las acciones necesitan decoradores. HealthCheck no tiene
// retry porque un fallo ahí debe detener el proceso inmediatamente.
// Aplicar RetryWrapper a todo sería over-engineering sin justificación real.
const actions = [
  new TimingWrapper(new RetryWrapper(rawActions[0])),
  new TimingWrapper(new RetryWrapper(rawActions[1])),
  new TimingWrapper(rawActions[2]),
  rawActions[3],
];

// - Strategy: el algoritmo de ejecución se resuelve en runtime
const executionStrategy = resolveStrategy(strategy);

// - Template Method: el pipeline define el esqueleto, la subclase el detalle
const pipeline = isHotfix
  ? new HotfixDeployment(actions, executionStrategy, notifier, logger)
  : new StandardDeployment(actions, executionStrategy, notifier, logger);

pipeline.deploy();

console.log("\n--- Registro de auditoría ---");
for (const entry of audit.getLog()) {
  console.log(entry);
}
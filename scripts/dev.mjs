import { spawn } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: "apps/web/.env.development" });

const dockerComposeFilePath = "apps/web/infra/docker-compose.development.yml";
const dockerComposeEnvFilePath = "apps/web/.env.development";
const waitForPostgresScriptPath =
  "apps/web/infra/scripts/wait-for-postgres.mjs";
const seedAllScriptPath = "apps/web/infra/scripts/seed-all.mjs";

const TOTAL_STEPS = 6;
const LOADING_DOT_INTERVAL_MS = 500;
let isShuttingDown = false;

function startStepLoading(stepNumber, message) {
  process.stdout.write(`[${stepNumber}/${TOTAL_STEPS}] ${message}`);
  const dotInterval = setInterval(() => {
    process.stdout.write(".");
  }, LOADING_DOT_INTERVAL_MS);

  return function finishStepLoading() {
    clearInterval(dotInterval);
    process.stdout.write(" ✓\n");
  };
}

function spawnProcess(command, processArgs = [], processOptions = {}) {
  return spawn(command, processArgs, {
    stdio: "inherit",
    ...processOptions,
  });
}

function destroyDockerServicesAndVolumes() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("\n> Stopping Docker services and removing volumes...");
  const dockerDownProcess = spawnProcess("docker", [
    "compose",
    "--env-file",
    dockerComposeEnvFilePath,
    "-f",
    dockerComposeFilePath,
    "down",
    "-v",
    "--remove-orphans",
  ]);
  dockerDownProcess.on("close", () => process.exit(0));
}

function startDockerServices() {
  return new Promise((resolvePromise, rejectPromise) => {
    const finishDockerStep = startStepLoading(1, "Starting Docker services");
    const dockerUpProcess = spawnProcess(
      "docker",
      [
        "compose",
        "--env-file",
        dockerComposeEnvFilePath,
        "-f",
        dockerComposeFilePath,
        "up",
        "-d",
        "--remove-orphans",
      ],
      { stdio: "ignore" },
    );
    dockerUpProcess.on("close", (exitCode) => {
      if (exitCode !== 0) return rejectPromise(exitCode);
      finishDockerStep();
      resolvePromise();
    });
  });
}

function waitForPostgres() {
  return new Promise((resolvePromise, rejectPromise) => {
    const finishPostgresStep = startStepLoading(2, "Waiting for Postgres");
    const waitForPostgresProcess = spawnProcess(
      "node",
      [waitForPostgresScriptPath],
      { stdio: "ignore" },
    );
    waitForPostgresProcess.on("close", (exitCode) => {
      if (exitCode !== 0) return rejectPromise(exitCode);
      finishPostgresStep();
      resolvePromise();
    });
  });
}

function runPrismaMigrations() {
  return new Promise((resolvePromise, rejectPromise) => {
    const finishMigrationsStep = startStepLoading(3, "Running migrations");
    const prismaMigrateProcess = spawnProcess(
      "npx",
      ["prisma", "migrate", "deploy"],
      { cwd: "apps/web", stdio: "ignore" },
    );
    prismaMigrateProcess.on("close", (exitCode) => {
      if (exitCode !== 0) return rejectPromise(exitCode);
      finishMigrationsStep();
      resolvePromise();
    });
  });
}

function generatePrismaClient() {
  return new Promise((resolvePromise, rejectPromise) => {
    const finishStep = startStepLoading(4, "Generating Prisma client");
    const generateProcess = spawnProcess("npx", ["prisma", "generate"], {
      cwd: "apps/web",
      stdio: "ignore",
    });
    generateProcess.on("close", (exitCode) => {
      if (exitCode !== 0) return rejectPromise(exitCode);
      finishStep();
      resolvePromise();
    });
  });
}

function seedAll() {
  return new Promise((resolvePromise, rejectPromise) => {
    const finishSeedStep = startStepLoading(5, "Seeding development data");
    const seedProcess = spawnProcess("node", [seedAllScriptPath], {
      stdio: "pipe",
    });

    let seedOutput = "";
    seedProcess.stdout.on("data", (chunk) => {
      seedOutput += chunk.toString();
    });

    seedProcess.on("close", (exitCode) => {
      if (exitCode !== 0) return rejectPromise(exitCode);
      finishSeedStep();

      const summaryLines = seedOutput
        .split("\n")
        .filter(
          (line) => line.startsWith(">") || line.startsWith("Credentials"),
        )
        .join("\n");

      if (summaryLines) {
        console.log(`\n${summaryLines}\n`);
      }

      resolvePromise();
    });
  });
}

async function startDevEnvironment() {
  await startDockerServices();
  await waitForPostgres();
  await runPrismaMigrations();
  await generatePrismaClient();
  await seedAll();

  console.log(`[6/${TOTAL_STEPS}] Starting Next.js ✓\n`);

  const nextDevProcess = spawn("npm run dev:web", [], {
    stdio: "inherit",
    shell: true,
    detached: true,
  });

  function shutdownAllProcesses(shutdownSignal) {
    try {
      process.kill(-nextDevProcess.pid, shutdownSignal);
    } catch {
      nextDevProcess.kill(shutdownSignal);
    }
    destroyDockerServicesAndVolumes();
  }

  ["SIGINT", "SIGTERM"].forEach((shutdownSignal) => {
    process.on(shutdownSignal, () => shutdownAllProcesses(shutdownSignal));
  });

  nextDevProcess.on("close", () => {
    destroyDockerServicesAndVolumes();
  });
}

startDevEnvironment().catch((startupError) => {
  console.error("> Failed to start dev environment:", startupError);
  process.exit(1);
});

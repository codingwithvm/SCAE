import { spawn } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: "apps/web/.env.development" });

const dockerComposeFilePath = "apps/web/infra/docker-compose.development.yml";
const dockerComposeEnvFilePath = "apps/web/.env.development";
const waitForPostgresScriptPath =
  "apps/web/infra/scripts/wait-for-postgres.mjs";
const seedDevelopmentUsersScriptPath =
  "apps/web/infra/scripts/seed-development-users.mjs";

const TOTAL_STEPS = 4;
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

function seedDevelopmentUsers() {
  return new Promise((resolvePromise, rejectPromise) => {
    const finishSeedStep = startStepLoading(4, "Seeding development users");
    const seedProcess = spawnProcess("node", [seedDevelopmentUsersScriptPath], {
      stdio: "pipe",
    });

    let seedOutput = "";
    seedProcess.stdout.on("data", (chunk) => {
      seedOutput += chunk.toString();
    });

    seedProcess.on("close", (exitCode) => {
      if (exitCode !== 0) return rejectPromise(exitCode);
      finishSeedStep();

      const credentialsBlock = seedOutput
        .split("\n")
        .filter((outputLine) => outputLine.startsWith(">"))
        .join("\n");

      if (credentialsBlock) {
        console.log(`\n${credentialsBlock}\n`);
      }

      resolvePromise();
    });
  });
}

async function startDevEnvironment() {
  await startDockerServices();
  await waitForPostgres();
  await runPrismaMigrations();
  await seedDevelopmentUsers();

  console.log("> Starting Next.js...\n");

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

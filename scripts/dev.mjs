import { spawn } from "child_process";

const dockerComposeFilePath = "apps/web/infra/docker-compose.development.yml";
const dockerComposeEnvFilePath = "apps/web/.env.development";
const waitForPostgresScriptPath =
  "apps/web/infra/scripts/wait-for-postgres.mjs";
let isShuttingDown = false;

function spawnProcess(command, args = [], options = {}) {
  return spawn(command, args, { stdio: "inherit", shell: true, ...options });
}

function stopDockerServices() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("\n🛑 Stopping Docker services...");
  const dockerStopProcess = spawnProcess("docker", [
    "compose",
    "--env-file",
    dockerComposeEnvFilePath,
    "-f",
    dockerComposeFilePath,
    "stop",
  ]);
  dockerStopProcess.on("close", () => process.exit(0));
}

function waitForPostgres() {
  return new Promise((resolve, reject) => {
    const waitForPostgresProcess = spawnProcess("node", [
      waitForPostgresScriptPath,
    ]);
    waitForPostgresProcess.on("close", (exitCode) =>
      exitCode === 0 ? resolve() : reject(exitCode),
    );
  });
}

const dockerUpProcess = spawnProcess("docker", [
  "compose",
  "--env-file",
  dockerComposeEnvFilePath,
  "-f",
  dockerComposeFilePath,
  "up",
  "-d",
  "--remove-orphans",
]);

dockerUpProcess.on("close", async (exitCode) => {
  if (exitCode !== 0) {
    console.error("Failed to start Docker services.");
    process.exit(exitCode);
  }

  await waitForPostgres();

  const nextDevProcess = spawn("npm", ["run", "dev:web"], {
    stdio: "inherit",
    shell: true,
    detached: true,
  });

  function shutdownAllProcesses(signal) {
    try {
      process.kill(-nextDevProcess.pid, signal);
    } catch {
      nextDevProcess.kill(signal);
    }
    stopDockerServices();
  }

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => shutdownAllProcesses(signal));
  });

  nextDevProcess.on("close", () => {
    stopDockerServices();
  });
});

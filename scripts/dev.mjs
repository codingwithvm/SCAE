import { spawn } from "child_process";

const composeFile = "apps/web/infra/compose.yaml";

function run(command, args = [], options = {}) {
  return spawn(command, args, { stdio: "inherit", shell: true, ...options });
}

function stopServices() {
  console.log("\n🛑 Stopping Docker services...");
  const stop = run("docker", ["compose", "-f", composeFile, "stop"]);
  stop.on("close", () => process.exit(0));
}

const up = run("docker", [
  "compose",
  "-f",
  composeFile,
  "up",
  "-d",
  "--remove-orphans",
]);

up.on("close", (code) => {
  if (code !== 0) {
    console.error("Failed to start Docker services.");
    process.exit(code);
  }

  const next = run("npm", ["run", "dev:web"]);

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      next.kill(signal);
      stopServices();
    });
  });

  next.on("close", (exitCode) => {
    stopServices();
    process.exit(exitCode);
  });
});

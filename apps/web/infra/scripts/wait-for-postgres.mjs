import { exec } from "child_process";

const postgresContainerName = "postgres-dev";
const retryIntervalMs = 500;

function checkIfPostgresIsReady() {
  exec(
    `docker exec ${postgresContainerName} pg_isready --host localhost`,
    (_, commandOutput) => {
      if (commandOutput.includes("accepting connections")) {
        process.exit(0);
      } else {
        setTimeout(checkIfPostgresIsReady, retryIntervalMs);
      }
    },
  );
}

checkIfPostgresIsReady();

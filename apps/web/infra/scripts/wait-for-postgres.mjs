import { exec } from "child_process";

const postgresContainerName = "postgres-dev";
const retryIntervalMs = 500;

function checkIfPostgresIsReady() {
  exec(
    `docker exec ${postgresContainerName} pg_isready --host localhost`,
    (_, commandOutput) => {
      if (commandOutput.includes("accepting connections")) {
        console.log("\nPostgres está pronto!\n");
        process.exit(0);
      } else {
        process.stdout.write(".");
        setTimeout(checkIfPostgresIsReady, retryIntervalMs);
      }
    },
  );
}

process.stdout.write("\nAguardando Postgres aceitar conexões");
checkIfPostgresIsReady();

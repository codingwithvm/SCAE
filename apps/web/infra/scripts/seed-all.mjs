import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scripts = [
  "seed-development-municipalities.mjs",
  "seed-development-schools.mjs",
  "seed-development-classes.mjs",
  "seed-development-users.mjs",
  "seed-development-student-classes.mjs",
  "seed-development-teacher-classes.mjs",
  "seed-development-releases.mjs",
];

console.log("=== SCAE Development Seed ===\n");

for (const script of scripts) {
  const scriptPath = path.join(__dirname, script);
  console.log(`Running: ${script}`);
  try {
    execSync(`node "${scriptPath}"`, { stdio: "inherit", env: process.env });
  } catch {
    console.error(`Failed: ${script}`);
    process.exit(1);
  }
  console.log("");
}

console.log("=== Seed complete ===");
console.log("\nCredentials:");
console.log(
  '  STUDENT (1a4):     matrícula "2026001" + nascimento "2015-03-10"',
);
console.log(
  '  STUDENT (5a9):     matrícula "2026002" + nascimento "2012-07-22"',
);
console.log('  TEACHER:           "professor@scae.dev" + "password"');
console.log('  SCHOOL_MANAGER:    "gestor.escola@scae.dev" + "password"');
console.log('  MUNICIPAL_MANAGER: "gestor.municipal@scae.dev" + "password"');
console.log('  ADMIN:             "admin@scae.dev" + "password"');

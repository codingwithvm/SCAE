import path from "path";
import { createRequire } from "module";

export interface GenSimuladorModule {
  generateHTML: (config: Record<string, unknown>) => string;
  validateConfig: (config: Record<string, unknown>) => void;
}

let _cached: GenSimuladorModule | null = null;
let _loadAttempted = false;

function loadModule(): GenSimuladorModule | null {
  if (_loadAttempted) return _cached;
  _loadAttempted = true;

  const filePath = path.join(
    process.cwd(),
    "src",
    "lib",
    "gscae",
    "gen_simulador_v4.cjs",
  );

  try {
    const req = createRequire(import.meta.url);
    _cached = req(filePath) as GenSimuladorModule;

    if (typeof _cached?.generateHTML !== "function") {
      _cached = null;
    }
  } catch {
    _cached = null;
  }

  return _cached;
}

export function isAvailable(): boolean {
  return loadModule() !== null;
}

export function generateHTML(config: Record<string, unknown>): string {
  const mod = loadModule();
  if (!mod) {
    throw new Error(
      "[G-SCAE] gen_simulador_v4.cjs not available at src/lib/gscae/",
    );
  }
  return mod.generateHTML(config);
}

export function validateConfig(config: Record<string, unknown>): void {
  const mod = loadModule();
  if (!mod) {
    throw new Error("[G-SCAE] gen_simulador_v4.cjs not available.");
  }
  mod.validateConfig(config);
}

export function tryGenerateHTML(
  config: Record<string, unknown>,
): string | null {
  try {
    return generateHTML(config);
  } catch {
    return null;
  }
}

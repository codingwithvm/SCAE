import { type TeacherAnswerValue } from "./quiz";

export type MceesMcProfileName =
  | "Criativo"
  | "Analítico"
  | "Estrategista"
  | "Prático";

export type MeesProfileName =
  | "Facilitador"
  | "Avaliador"
  | "Especialista"
  | "Mentor";

export interface QuadrantScores {
  x: number;
  y: number;
}

export interface MceesMcPercentages {
  Criativo: number;
  Analítico: number;
  Estrategista: number;
  Prático: number;
}

export interface MeesPercentages {
  Facilitador: number;
  Avaliador: number;
  Especialista: number;
  Mentor: number;
}

export interface TeacherMceesResult {
  profile: MceesMcProfileName;
  scores: QuadrantScores;
  percentages: MceesMcPercentages;
}

export interface TeacherMeesResult {
  profile: MeesProfileName;
  scores: QuadrantScores;
  percentages: MeesPercentages;
}

const TEACHER_MCEES_CENTERS: Record<MceesMcProfileName, QuadrantScores> = {
  Criativo: { x: 16, y: 16 },
  Analítico: { x: -16, y: 16 },
  Estrategista: { x: -16, y: -16 },
  Prático: { x: 16, y: -16 },
};

const MCEES_PROFILE_ORDER: MceesMcProfileName[] = [
  "Criativo",
  "Analítico",
  "Estrategista",
  "Prático",
];

const TEACHER_MEES_CENTERS: Record<MeesProfileName, QuadrantScores> = {
  Facilitador: { x: 16, y: 16 },
  Avaliador: { x: -16, y: 16 },
  Especialista: { x: -16, y: -16 },
  Mentor: { x: 16, y: -16 },
};

const MEES_PROFILE_ORDER: MeesProfileName[] = [
  "Facilitador",
  "Avaliador",
  "Especialista",
  "Mentor",
];

export function calculateTeacherMcees(
  answers: Record<number, TeacherAnswerValue>,
): TeacherMceesResult {
  const { x, y } = biaxialScore(answers);
  const profile = resolveMceesProfile(x, y);
  const percentages = calcMceesPercentages(x, y);
  return { profile, scores: { x, y }, percentages };
}

export function calculateTeacherMees(
  answers: Record<number, TeacherAnswerValue>,
): TeacherMeesResult {
  const { x, y } = biaxialScore(answers);
  const profile = resolveMeesProfile(x, y);
  const percentages = calcMeesPercentages(x, y);
  return { profile, scores: { x, y }, percentages };
}

function biaxialScore(
  answers: Record<number, TeacherAnswerValue>,
): QuadrantScores {
  let x = 0;
  let y = 0;

  const sortedIds = Object.keys(answers)
    .map(Number)
    .sort((a, b) => a - b);

  sortedIds.forEach((id, index) => {
    const v = answers[id];
    const q = index % 4;
    if (q === 0) {
      x += v;
      y += v;
    } else if (q === 1) {
      x -= v;
      y += v;
    } else if (q === 2) {
      x -= v;
      y -= v;
    } else {
      x += v;
      y -= v;
    }
  });

  return { x, y };
}

function resolveMceesProfile(x: number, y: number): MceesMcProfileName {
  if (x >= 0 && y >= 0) return "Criativo";
  if (x < 0 && y >= 0) return "Analítico";
  if (x < 0 && y < 0) return "Estrategista";
  return "Prático";
}

function resolveMeesProfile(x: number, y: number): MeesProfileName {
  if (x >= 0 && y >= 0) return "Facilitador";
  if (x < 0 && y >= 0) return "Avaliador";
  if (x < 0 && y < 0) return "Especialista";
  return "Mentor";
}

function euclidean(px: number, py: number, cx: number, cy: number): number {
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}

function calcMceesPercentages(x: number, y: number): MceesMcPercentages {
  const dists = MCEES_PROFILE_ORDER.map((p) => ({
    p,
    d: euclidean(x, y, TEACHER_MCEES_CENTERS[p].x, TEACHER_MCEES_CENTERS[p].y),
  }));
  const invs = dists.map(({ p, d }) => ({
    p,
    inv: d === 0 ? Infinity : 1 / d,
  }));
  const total = invs.reduce((s, { inv }) => s + (isFinite(inv) ? inv : 0), 0);
  const pct = {} as MceesMcPercentages;
  invs.forEach(({ p, inv }) => {
    if (!isFinite(inv)) {
      MCEES_PROFILE_ORDER.forEach((name) => (pct[name] = name === p ? 100 : 0));
    } else {
      pct[p] =
        total > 0
          ? Math.round((inv / total) * 100)
          : Math.round(100 / MCEES_PROFILE_ORDER.length);
    }
  });
  return pct;
}

function calcMeesPercentages(x: number, y: number): MeesPercentages {
  const dists = MEES_PROFILE_ORDER.map((p) => ({
    p,
    d: euclidean(x, y, TEACHER_MEES_CENTERS[p].x, TEACHER_MEES_CENTERS[p].y),
  }));
  const invs = dists.map(({ p, d }) => ({
    p,
    inv: d === 0 ? Infinity : 1 / d,
  }));
  const total = invs.reduce((s, { inv }) => s + (isFinite(inv) ? inv : 0), 0);
  const pct = {} as MeesPercentages;
  invs.forEach(({ p, inv }) => {
    if (!isFinite(inv)) {
      MEES_PROFILE_ORDER.forEach((name) => (pct[name] = name === p ? 100 : 0));
    } else {
      pct[p] =
        total > 0
          ? Math.round((inv / total) * 100)
          : Math.round(100 / MEES_PROFILE_ORDER.length);
    }
  });
  return pct;
}

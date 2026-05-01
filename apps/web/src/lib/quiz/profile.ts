export type ScaleValue = 1 | 2 | 3 | 4 | 5;

export type ProfileName = "Criativo" | "Analítico" | "Estrategista" | "Prático";

export interface QuadrantScores {
  x: number;
  y: number;
}

export interface ProfilePercentages {
  Criativo: number;
  Analítico: number;
  Estrategista: number;
  Prático: number;
}

export interface ProfileResult {
  profile: ProfileName;
  scores: QuadrantScores;
  percentages: ProfilePercentages;
}

// Centers for GRADE5_TO_9 form type (steps.md section 1.5)
const QUADRANT_CENTERS: Record<ProfileName, QuadrantScores> = {
  Criativo: { x: 24, y: 24 },
  Analítico: { x: -24, y: 24 },
  Estrategista: { x: -24, y: -24 },
  Prático: { x: 24, y: -24 },
};

const PROFILE_ORDER: ProfileName[] = [
  "Criativo",
  "Analítico",
  "Estrategista",
  "Prático",
];

/**
 * Bi-axial profile calculation algorithm from the doctoral research.
 *
 * For each answer at position i (0-indexed):
 *   quadrant = i mod 4
 *   q0 (Criativo):     x += value, y += value
 *   q1 (Analítico):    x -= value, y += value
 *   q2 (Estrategista): x -= value, y -= value
 *   q3 (Prático):      x += value, y -= value
 *
 * Final profile = quadrant of (x, y):
 *   (+x, +y) = Criativo
 *   (-x, +y) = Analítico
 *   (-x, -y) = Estrategista
 *   (+x, -y) = Prático
 *
 * Percentage = inverse euclidean distance to each quadrant center, normalized to 100%.
 */
export function calculateProfile(
  answers: Record<number, ScaleValue>,
): ProfileResult {
  let x = 0;
  let y = 0;

  // Questions are 1-indexed; sort by id for deterministic order
  const sortedQuestionIds = Object.keys(answers)
    .map(Number)
    .sort((a, b) => a - b);

  sortedQuestionIds.forEach((questionId, index) => {
    const answerValue = answers[questionId];
    const quadrantIndex = index % 4;

    if (quadrantIndex === 0) {
      x += answerValue;
      y += answerValue;
    } else if (quadrantIndex === 1) {
      x -= answerValue;
      y += answerValue;
    } else if (quadrantIndex === 2) {
      x -= answerValue;
      y -= answerValue;
    } else {
      x += answerValue;
      y -= answerValue;
    }
  });

  const dominantProfile = resolveDominantProfile(x, y);

  const percentages = calculatePercentages(x, y);

  return { profile: dominantProfile, scores: { x, y }, percentages };
}

function resolveDominantProfile(x: number, y: number): ProfileName {
  if (x >= 0 && y >= 0) return "Criativo";
  if (x < 0 && y >= 0) return "Analítico";
  if (x < 0 && y < 0) return "Estrategista";
  return "Prático";
}

function euclideanDistance(
  pointX: number,
  pointY: number,
  centerX: number,
  centerY: number,
): number {
  return Math.sqrt((pointX - centerX) ** 2 + (pointY - centerY) ** 2);
}

function calculatePercentages(x: number, y: number): ProfilePercentages {
  const distances = PROFILE_ORDER.map((profileName) => ({
    profileName,
    distance: euclideanDistance(
      x,
      y,
      QUADRANT_CENTERS[profileName].x,
      QUADRANT_CENTERS[profileName].y,
    ),
  }));

  // Inverse distances — closer = higher affinity
  const inverseDistances = distances.map(({ profileName, distance }) => ({
    profileName,
    inverse: distance === 0 ? Infinity : 1 / distance,
  }));

  const totalInverse = inverseDistances.reduce(
    (sum, { inverse }) => sum + (isFinite(inverse) ? inverse : 0),
    0,
  );

  const percentages = {} as ProfilePercentages;

  inverseDistances.forEach(({ profileName, inverse }) => {
    if (!isFinite(inverse)) {
      // Exactly on a center: 100% that profile
      PROFILE_ORDER.forEach((name) => {
        percentages[name] = name === profileName ? 100 : 0;
      });
    } else {
      percentages[profileName] =
        totalInverse > 0
          ? Math.round((inverse / totalInverse) * 100)
          : Math.round(100 / PROFILE_ORDER.length);
    }
  });

  return percentages;
}

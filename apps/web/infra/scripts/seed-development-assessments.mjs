import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const PROFILES_1A4 = ["Criativo", "Analítico", "Estrategista", "Prático"];

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateResult(profile, rand, instrument) {
  const dims = { CA: 0, EC: 0, EA: 0, OR: 0 };

  switch (profile) {
    case "Estrategista":
      dims.CA = 10 + Math.floor(rand() * 4);
      dims.EC = 4 + Math.floor(rand() * 3);
      dims.EA = 12 + Math.floor(rand() * 4);
      dims.OR = 5 + Math.floor(rand() * 3);
      break;
    case "Analítico":
      dims.CA = 11 + Math.floor(rand() * 4);
      dims.EC = 4 + Math.floor(rand() * 3);
      dims.EA = 4 + Math.floor(rand() * 3);
      dims.OR = 11 + Math.floor(rand() * 4);
      break;
    case "Criativo":
      dims.CA = 4 + Math.floor(rand() * 3);
      dims.EC = 11 + Math.floor(rand() * 4);
      dims.EA = 4 + Math.floor(rand() * 3);
      dims.OR = 11 + Math.floor(rand() * 4);
      break;
    case "Prático":
      dims.CA = 4 + Math.floor(rand() * 3);
      dims.EC = 11 + Math.floor(rand() * 4);
      dims.EA = 12 + Math.floor(rand() * 4);
      dims.OR = 4 + Math.floor(rand() * 3);
      break;
  }

  const X = dims.EA - dims.OR;
  const Y = dims.CA - dims.EC;
  const pMax = 8;
  const confX = Math.min(100, Math.round((Math.abs(X) / pMax) * 100));
  const confY = Math.min(100, Math.round((Math.abs(Y) / pMax) * 100));

  let tier;
  if (confX >= 55 && confY >= 55) tier = "CONFIRMED";
  else if (confX >= 40 || confY >= 40) tier = "PREDOMINANT";
  else tier = "IN_MAPPING";

  const blockRanks = {};
  for (let b = 1; b <= 8; b++) {
    const order = [1, 2, 3, 4].sort(() => rand() - 0.5);
    blockRanks[String(b)] = {
      CA: order[0],
      EC: order[1],
      EA: order[2],
      OR: order[3],
    };
  }

  const fullResultJson = {
    instrument: instrument.toLowerCase(),
    dimensions: dims,
    X,
    Y,
    confX,
    confY,
    profile,
    tier,
    extraAdj: null,
    blockRanks,
  };

  const scoresJson = dims;

  let quadrant;
  if (X > 0 && Y > 0) quadrant = 1;
  else if (X < 0 && Y > 0) quadrant = 2;
  else if (X < 0 && Y < 0) quadrant = 3;
  else quadrant = 4;

  return {
    profile,
    quadrant,
    X,
    Y,
    confX,
    confY,
    tier,
    scoresJson,
    fullResultJson,
  };
}

const studentsToAssess = [
  { reg: "2026101", instrument: "MCEES_1A4" },
  { reg: "2026102", instrument: "MCEES_1A4" },
  { reg: "2026103", instrument: "MCEES_1A4" },
  { reg: "2026104", instrument: "MCEES_1A4" },
  { reg: "2026105", instrument: "MCEES_1A4" },
  // 2026106, 2026107, 2026108 ficam pendentes

  { reg: "2026201", instrument: "MCEES_1A4" },
  { reg: "2026202", instrument: "MCEES_1A4" },
  { reg: "2026203", instrument: "MCEES_1A4" },
  { reg: "2026204", instrument: "MCEES_1A4" },
  { reg: "2026205", instrument: "MCEES_1A4" },
  { reg: "2026206", instrument: "MCEES_1A4" },
  // 2026207, 2026208 ficam pendentes

  { reg: "2026301", instrument: "MCEES_1A4" },
  { reg: "2026302", instrument: "MCEES_1A4" },
  { reg: "2026303", instrument: "MCEES_1A4" },
  { reg: "2026304", instrument: "MCEES_1A4" },
  { reg: "2026305", instrument: "MCEES_1A4" },
  // 2026306, 2026307, 2026308 ficam pendentes

  { reg: "2026401", instrument: "MCEES_1A4" },
  { reg: "2026402", instrument: "MCEES_1A4" },
  { reg: "2026403", instrument: "MCEES_1A4" },
  { reg: "2026404", instrument: "MCEES_1A4" },
  { reg: "2026405", instrument: "MCEES_1A4" },
  { reg: "2026406", instrument: "MCEES_1A4" },
  // 2026407, 2026408 ficam pendentes

  { reg: "2026501", instrument: "MCEES_5A9" },
  { reg: "2026502", instrument: "MCEES_5A9" },
  { reg: "2026503", instrument: "MCEES_5A9" },
  { reg: "2026504", instrument: "MCEES_5A9" },
  { reg: "2026505", instrument: "MCEES_5A9" },
  { reg: "2026506", instrument: "MCEES_5A9" },
  { reg: "2026507", instrument: "MCEES_5A9" },
  // 2026508, 2026509 ficam pendentes

  { reg: "2026601", instrument: "MCEES_5A9" },
  { reg: "2026602", instrument: "MCEES_5A9" },
  { reg: "2026603", instrument: "MCEES_5A9" },
  { reg: "2026604", instrument: "MCEES_5A9" },
  { reg: "2026605", instrument: "MCEES_5A9" },
  // 2026606, 2026607, 2026608 ficam pendentes

  { reg: "2026701", instrument: "MCEES_5A9" },
  { reg: "2026702", instrument: "MCEES_5A9" },
  { reg: "2026703", instrument: "MCEES_5A9" },
  { reg: "2026704", instrument: "MCEES_5A9" },
  { reg: "2026705", instrument: "MCEES_5A9" },
  { reg: "2026706", instrument: "MCEES_5A9" },
  // 2026707, 2026708 ficam pendentes

  { reg: "2026801", instrument: "MCEES_5A9" },
  { reg: "2026802", instrument: "MCEES_5A9" },
  { reg: "2026803", instrument: "MCEES_5A9" },
  { reg: "2026804", instrument: "MCEES_5A9" },
  { reg: "2026805", instrument: "MCEES_5A9" },
  { reg: "2026806", instrument: "MCEES_5A9" },
  // 2026807, 2026808 ficam pendentes

  { reg: "2026901", instrument: "MCEES_5A9" },
  { reg: "2026902", instrument: "MCEES_5A9" },
  { reg: "2026903", instrument: "MCEES_5A9" },
  { reg: "2026904", instrument: "MCEES_5A9" },
  { reg: "2026905", instrument: "MCEES_5A9" },
  { reg: "2026906", instrument: "MCEES_5A9" },
  // 2026907, 2026908 ficam pendentes
];

seedDevelopmentAssessments();

async function seedDevelopmentAssessments() {
  await databaseClient.connect();

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < studentsToAssess.length; i++) {
    const student = studentsToAssess[i];
    const rand = seededRandom(i * 7919 + 42);
    const profile = PROFILES_1A4[i % PROFILES_1A4.length];
    const result = generateResult(profile, rand, student.instrument);

    const wasCreated = await insertAssessment(student, result);
    if (wasCreated) created++;
    else skipped++;
  }

  await databaseClient.end();

  console.log(
    `> ${created} assessments created, ${skipped} skipped (already exist)`,
  );
  console.log(
    `> ~${studentsToAssess.length} students assessed, remainder left as pending`,
  );
}

async function insertAssessment(student, result) {
  try {
    const existsQuery = {
      text: `
        SELECT 1 FROM scae_assessments a
        INNER JOIN scae_users u ON u.id = a."userId"
        WHERE u."registrationNumber" = $1
          AND a.instrument = $2::"Instrument"
          AND a.state = 'COMPLETE'::"AssessmentState"
        LIMIT 1;
      `,
      values: [student.reg, student.instrument],
    };

    const existing = await databaseClient.query(existsQuery);
    if (existing.rows.length > 0) return false;

    const getReleaseQuery = {
      text: `
        SELECT ar.id FROM scae_assessment_releases ar
        INNER JOIN scae_users u ON u.id = ar."userId"
        WHERE u."registrationNumber" = $1
          AND ar."instrument" = $2::"Instrument"
        LIMIT 1;
      `,
      values: [student.reg, student.instrument],
    };

    const releaseResult = await databaseClient.query(getReleaseQuery);
    const releaseId = releaseResult.rows[0]?.id || null;

    const insertAssessmentQuery = {
      text: `
        INSERT INTO scae_assessments (
          id, "userId", instrument, release_id, state,
          responses_json, started_at, completed_at,
          total_time_seconds, "createdAt", "updatedAt"
        )
        SELECT
          gen_random_uuid(),
          u.id,
          $1::"Instrument",
          $2,
          'COMPLETE'::"AssessmentState",
          '{}',
          NOW() - INTERVAL '2 hours',
          NOW() - INTERVAL '1 hour',
          FLOOR(300 + RANDOM() * 600)::int,
          NOW(),
          NOW()
        FROM scae_users u
        WHERE u."registrationNumber" = $3
        RETURNING id;
      `,
      values: [student.instrument, releaseId, student.reg],
    };

    const assessmentRes = await databaseClient.query(insertAssessmentQuery);
    const assessmentId = assessmentRes.rows[0]?.id;
    if (!assessmentId) return false;

    if (releaseId) {
      await databaseClient.query({
        text: `UPDATE scae_assessment_releases SET state = 'CONSUMED'::"ReleaseState" WHERE id = $1;`,
        values: [releaseId],
      });
    }

    const insertResultQuery = {
      text: `
        INSERT INTO scae_assessment_results (
          id, assessment_id, profile, quadrant,
          axis_x, axis_y, conf_x, conf_y,
          tier, scores_json, full_result_json,
          engine_version, "createdAt"
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3,
          $4, $5, $6, $7,
          $8::"ConsistencyTier", $9, $10,
          '1.0.0', NOW()
        );
      `,
      values: [
        assessmentId,
        result.profile,
        result.quadrant,
        result.fullResultJson.X,
        result.fullResultJson.Y,
        result.confX,
        result.confY,
        result.tier,
        JSON.stringify(result.scoresJson),
        JSON.stringify(result.fullResultJson),
      ],
    };

    await databaseClient.query(insertResultQuery);
    return true;
  } catch (err) {
    console.error(`> Failed for ${student.reg}: ${err.message}`);
    return false;
  }
}

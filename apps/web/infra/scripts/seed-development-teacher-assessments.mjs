import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/** Gera fullResultJson para MCEES_PROF (4 blocos de ranking, pMax=8) */
function generateMCEESProfResult(profile, rand) {
  const dims = { CA: 0, EC: 0, EA: 0, OR: 0 };

  // Pontuações que garantem o perfil desejado (Estrategista: CA↑ EA↑)
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

  // 4 blocos de ranking (b0–b3)
  const blockRanks = {};
  for (let b = 0; b < 4; b++) {
    const order = [1, 2, 3, 4].sort(() => rand() - 0.5);
    blockRanks[String(b)] = {
      CA: order[0],
      EC: order[1],
      EA: order[2],
      OR: order[3],
    };
  }

  let quadrant;
  if (X > 0 && Y > 0) quadrant = 1;
  else if (X < 0 && Y > 0) quadrant = 2;
  else if (X < 0 && Y < 0) quadrant = 3;
  else quadrant = 4;

  return {
    profile,
    quadrant,
    confX,
    confY,
    tier,
    scoresJson: dims,
    fullResultJson: {
      instrument: "mcees_prof",
      dimensions: dims,
      X,
      Y,
      confX,
      confY,
      profile,
      tier,
      extraAdj: null,
      blockRanks,
    },
  };
}

/** Gera fullResultJson para MEES_PROF (32 pares A/B, pMax=11) */
function generateMEESProfResult(profile, rand) {
  // Dimensões alvo baseadas no perfil desejado
  // Avaliador: CA>EC e EA>OR → Y>0 e X>0
  // Especialista: CA>EC e OR>=EA → Y>0 e X<=0
  // Mentor: EC>=CA e OR>EA → Y<=0 e X<0
  // Facilitador: EC>=CA e EA>=OR → Y<=0 e X>=0

  let targetCA, targetEC, targetEA, targetOR;
  switch (profile) {
    case "Avaliador":
      targetCA = 9 + Math.floor(rand() * 3); // CA > EC
      targetEC = 5 + Math.floor(rand() * 3);
      targetEA = 10 + Math.floor(rand() * 3); // EA > OR
      targetOR = 5 + Math.floor(rand() * 3);
      break;
    case "Especialista":
      targetCA = 9 + Math.floor(rand() * 3); // CA > EC
      targetEC = 5 + Math.floor(rand() * 3);
      targetEA = 5 + Math.floor(rand() * 3); // OR >= EA
      targetOR = 10 + Math.floor(rand() * 3);
      break;
    case "Mentor":
      targetCA = 5 + Math.floor(rand() * 3); // EC >= CA
      targetEC = 9 + Math.floor(rand() * 3);
      targetEA = 5 + Math.floor(rand() * 3); // OR > EA
      targetOR = 10 + Math.floor(rand() * 3);
      break;
    case "Facilitador":
      targetCA = 5 + Math.floor(rand() * 3); // EC >= CA
      targetEC = 9 + Math.floor(rand() * 3);
      targetEA = 10 + Math.floor(rand() * 3); // EA >= OR
      targetOR = 5 + Math.floor(rand() * 3);
      break;
    default: // Equilibrado
      targetCA = 8;
      targetEC = 8;
      targetEA = 8;
      targetOR = 8;
  }

  // Ajusta para somar 32 (total de pares)
  const total = targetCA + targetEC + targetEA + targetOR;
  const diff = 32 - total;
  targetCA += diff; // absorve diferença em CA

  const dims = { CA: targetCA, EC: targetEC, EA: targetEA, OR: targetOR };

  // Gera meesAnswers (p1–p32) consistentes com as dimensões
  // Mapeamento simplificado dos 32 pares: cada par confronta duas dimensões
  // Ordem dos pares por seção (A.d vs B.d):
  const pairMap = [
    // s1: p1–p8
    { A: "CA", B: "EC" }, { A: "EA", B: "OR" }, { A: "CA", B: "OR" },
    { A: "EC", B: "EA" }, { A: "CA", B: "EA" }, { A: "EC", B: "OR" },
    { A: "OR", B: "EC" }, { A: "EA", B: "CA" },
    // s2: p9–p16
    { A: "CA", B: "EC" }, { A: "EA", B: "OR" }, { A: "EC", B: "CA" },
    { A: "OR", B: "EA" }, { A: "EA", B: "EC" }, { A: "CA", B: "OR" },
    { A: "OR", B: "CA" }, { A: "EC", B: "EA" },
    // s3: p17–p24
    { A: "CA", B: "EC" }, { A: "OR", B: "EA" }, { A: "EC", B: "OR" },
    { A: "EA", B: "CA" }, { A: "CA", B: "EA" }, { A: "EC", B: "CA" },
    { A: "OR", B: "EC" }, { A: "EA", B: "OR" },
    // s4: p25–p32
    { A: "CA", B: "EC" }, { A: "OR", B: "EA" }, { A: "EC", B: "CA" },
    { A: "EA", B: "OR" }, { A: "CA", B: "OR" }, { A: "EC", B: "EA" },
    { A: "OR", B: "EC" }, { A: "EA", B: "CA" },
  ];

  // Distribui as respostas para atingir as dimensões alvo
  const remaining = { ...dims };
  const meesAnswers = {};

  for (let i = 0; i < pairMap.length; i++) {
    const pair = pairMap[i];
    const key = "p" + (i + 1);
    const rA = remaining[pair.A] || 0;
    const rB = remaining[pair.B] || 0;

    let answer;
    if (rA > rB) {
      answer = "A";
      remaining[pair.A] = Math.max(0, remaining[pair.A] - 1);
    } else if (rB > rA) {
      answer = "B";
      remaining[pair.B] = Math.max(0, remaining[pair.B] - 1);
    } else {
      // empate: escolha pseudoaleatória
      answer = rand() > 0.5 ? "A" : "B";
      remaining[answer === "A" ? pair.A : pair.B] = Math.max(
        0,
        remaining[answer === "A" ? pair.A : pair.B] - 1,
      );
    }
    meesAnswers[key] = answer;
  }

  const X = dims.EA - dims.OR;
  const Y = dims.CA - dims.EC;
  const pMax = 11;
  const confX = Math.min(100, Math.round((Math.abs(X) / pMax) * 100));
  const confY = Math.min(100, Math.round((Math.abs(Y) / pMax) * 100));

  let tier;
  if (confX >= 55 && confY >= 55) tier = "CONFIRMED";
  else if (confX >= 40 || confY >= 40) tier = "PREDOMINANT";
  else tier = "IN_MAPPING";

  let quadrant;
  if (X > 0 && Y > 0) quadrant = 1;
  else if (X < 0 && Y > 0) quadrant = 2;
  else if (X < 0 && Y < 0) quadrant = 3;
  else quadrant = 4;

  return {
    profile,
    quadrant,
    confX,
    confY,
    tier,
    scoresJson: dims,
    fullResultJson: {
      instrument: "mees_prof",
      dimensions: dims,
      X,
      Y,
      confX,
      confY,
      profile,
      tier,
      extraAdj: null,
      meesAnswers,
    },
  };
}

// ─── Assessments para professor@scae.dev ────────────────────────────────────
// professor2@scae.dev fica com releases PENDING (sem perfil definido)

const teacherAssessments = [
  {
    email: "professor@scae.dev",
    instrument: "MCEES_PROF",
    profile: "Estrategista",
    seed: 99991,
  },
  {
    email: "professor@scae.dev",
    instrument: "MEES_PROF",
    profile: "Avaliador",
    seed: 99992,
  },
];

seedTeacherAssessments();

async function seedTeacherAssessments() {
  await databaseClient.connect();

  let created = 0;
  let skipped = 0;

  for (const entry of teacherAssessments) {
    const rand = seededRandom(entry.seed);

    const result =
      entry.instrument === "MEES_PROF"
        ? generateMEESProfResult(entry.profile, rand)
        : generateMCEESProfResult(entry.profile, rand);

    const wasCreated = await insertTeacherAssessment(entry, result);
    if (wasCreated) created++;
    else skipped++;
  }

  await databaseClient.end();

  console.log(
    `> ${created} teacher assessments created, ${skipped} skipped (already exist)`,
  );
  console.log(
    `> professor@scae.dev → MCEES_PROF (Estrategista) + MEES_PROF (Avaliador)`,
  );
  console.log(`> professor2@scae.dev → PENDING (sem perfil definido)`);
}

async function insertTeacherAssessment(entry, result) {
  try {
    // Verifica se já existe assessment COMPLETE para este professor/instrumento
    const existsResult = await databaseClient.query({
      text: `
        SELECT 1 FROM scae_assessments a
        INNER JOIN scae_users u ON u.id = a."userId"
        WHERE u.email = $1
          AND a.instrument = $2::"Instrument"
          AND a.state = 'COMPLETE'::"AssessmentState"
        LIMIT 1;
      `,
      values: [entry.email, entry.instrument],
    });

    if (existsResult.rows.length > 0) return false;

    // Busca o release PENDING
    const releaseResult = await databaseClient.query({
      text: `
        SELECT ar.id FROM scae_assessment_releases ar
        INNER JOIN scae_users u ON u.id = ar."userId"
        WHERE u.email = $1
          AND ar.instrument = $2::"Instrument"
          AND ar.state = 'PENDING'::"ReleaseState"
        LIMIT 1;
      `,
      values: [entry.email, entry.instrument],
    });

    const releaseId = releaseResult.rows[0]?.id || null;

    // Insere o assessment COMPLETE
    const assessmentRes = await databaseClient.query({
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
          NOW() - INTERVAL '3 hours',
          NOW() - INTERVAL '2 hours',
          FLOOR(600 + RANDOM() * 900)::int,
          NOW(),
          NOW()
        FROM scae_users u
        WHERE u.email = $3
        RETURNING id;
      `,
      values: [entry.instrument, releaseId, entry.email],
    });

    const assessmentId = assessmentRes.rows[0]?.id;
    if (!assessmentId) return false;

    // Marca o release como CONSUMED
    if (releaseId) {
      await databaseClient.query({
        text: `UPDATE scae_assessment_releases SET state = 'CONSUMED'::"ReleaseState" WHERE id = $1;`,
        values: [releaseId],
      });
    }

    // Insere o resultado
    await databaseClient.query({
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
    });

    console.log(
      `> ${entry.email} — ${entry.instrument} (${result.profile}) seeded`,
    );
    return true;
  } catch (err) {
    console.error(`> Failed for ${entry.email}/${entry.instrument}: ${err.message}`);
    return false;
  }
}

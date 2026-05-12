import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

function regs(from, to) {
  const result = [];
  for (let i = Number(from); i <= Number(to); i++) {
    result.push(String(i));
  }
  return result;
}

function studentReleases(regNumbers, instrument, className) {
  return regNumbers.map((reg) => ({
    userEmail: null,
    userRegistrationNumber: reg,
    instrument,
    className,
    classYear: 2026,
    grantedByEmail: "gestor.escola@scae.dev",
  }));
}

const developmentReleases = [
  ...studentReleases(regs("2026101", "2026108"), "MCEES_1A4", "1º Ano A"),
  ...studentReleases(regs("2026201", "2026208"), "MCEES_1A4", "2º Ano A"),
  ...studentReleases(regs("2026301", "2026308"), "MCEES_1A4", "3º Ano A"),
  ...studentReleases(regs("2026401", "2026408"), "MCEES_1A4", "4º Ano A"),
  ...studentReleases(regs("2026501", "2026509"), "MCEES_5A9", "5º Ano A"),
  ...studentReleases(regs("2026601", "2026608"), "MCEES_5A9", "6º Ano A"),
  ...studentReleases(regs("2026701", "2026708"), "MCEES_5A9", "7º Ano A"),
  ...studentReleases(regs("2026801", "2026808"), "MCEES_5A9", "8º Ano A"),
  ...studentReleases(regs("2026901", "2026908"), "MCEES_5A9", "9º Ano A"),
  {
    userEmail: "professor@scae.dev",
    userRegistrationNumber: null,
    instrument: "MCEES_PROF",
    className: "1º Ano A",
    classYear: 2026,
    grantedByEmail: "gestor.escola@scae.dev",
  },
  {
    userEmail: "professor@scae.dev",
    userRegistrationNumber: null,
    instrument: "MEES_PROF",
    className: "1º Ano A",
    classYear: 2026,
    grantedByEmail: "gestor.escola@scae.dev",
  },
  {
    userEmail: "professor2@scae.dev",
    userRegistrationNumber: null,
    instrument: "MCEES_PROF",
    className: "5º Ano A",
    classYear: 2026,
    grantedByEmail: "gestor.escola@scae.dev",
  },
  {
    userEmail: "professor2@scae.dev",
    userRegistrationNumber: null,
    instrument: "MEES_PROF",
    className: "5º Ano A",
    classYear: 2026,
    grantedByEmail: "gestor.escola@scae.dev",
  },
];

seedDevelopmentReleases();

async function seedDevelopmentReleases() {
  await databaseClient.connect();

  for (const release of developmentReleases) {
    await insertDevelopmentRelease(release);
  }

  await databaseClient.end();

  const studentCount = developmentReleases.filter(
    (r) => r.userRegistrationNumber,
  ).length;
  const teacherCount = developmentReleases.filter((r) => r.userEmail).length;
  console.log(
    `> ${studentCount} student releases + ${teacherCount} teacher releases created`,
  );
}

async function insertDevelopmentRelease(release) {
  try {
    const existsQuery = {
      text: `
        SELECT 1 FROM scae_assessments a
        INNER JOIN scae_users u ON u.id = a."userId"
        WHERE (u.email = $1 OR u."registrationNumber" = $2)
          AND a.instrument = $3::"Instrument"
          AND a.completed_at IS NOT NULL
        LIMIT 1;
      `,
      values: [
        release.userEmail,
        release.userRegistrationNumber,
        release.instrument,
      ],
    };

    const existing = await databaseClient.query(existsQuery);
    if (existing.rows.length > 0) {
      const identifier = release.userEmail || release.userRegistrationNumber;
      console.log(
        `> ${identifier} — ${release.instrument} (SKIPPED: already COMPLETE)`,
      );
      return;
    }

    const query = {
      text: `
        INSERT INTO scae_assessment_releases (
          id, "userId", "instrument", "state", "classId", "released_by_id",
          "expires_at", "createdAt", "updatedAt"
        )
        SELECT
          gen_random_uuid(),
          target_user.id,
          $1::"Instrument",
          'PENDING'::"ReleaseState",
          class_ref.id,
          grantor.id,
          NOW() + INTERVAL '90 days',
          NOW(),
          NOW()
        FROM scae_users target_user
        INNER JOIN scae_users grantor ON grantor.email = $2
        LEFT JOIN scae_classes class_ref
          ON class_ref.name = $3 AND class_ref.year = $4
        WHERE (target_user.email = $5 OR target_user."registrationNumber" = $6)
          AND NOT EXISTS (
            SELECT 1 FROM scae_assessment_releases ar
            WHERE ar."userId" = target_user.id
              AND ar."instrument" = $1::"Instrument"
          )
        LIMIT 1;
      `,
      values: [
        release.instrument,
        release.grantedByEmail,
        release.className,
        release.classYear,
        release.userEmail,
        release.userRegistrationNumber,
      ],
    };

    await databaseClient.query(query);
  } catch (insertError) {
    const identifier = release.userEmail || release.userRegistrationNumber;
    console.error(
      `> Failed to insert release for ${identifier}: ${insertError.message}`,
    );
  }
}

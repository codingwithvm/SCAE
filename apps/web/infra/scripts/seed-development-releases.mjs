import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentReleases = [
  {
    userEmail: null,
    userRegistrationNumber: "2026001",
    instrument: "MCEES_1A4",
    className: "1º Ano A",
    classYear: 2026,
    grantedByEmail: "gestor.escola@scae.dev",
  },
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
];

seedDevelopmentReleases();

async function seedDevelopmentReleases() {
  await databaseClient.connect();

  for (const release of developmentReleases) {
    await insertDevelopmentRelease(release);
  }

  await databaseClient.end();

  for (const release of developmentReleases) {
    const identifier = release.userEmail || release.userRegistrationNumber;
    console.log(`> ${identifier} — ${release.instrument} (PENDING)`);
  }
}

async function insertDevelopmentRelease(release) {
  try {
    const query = {
      text: `
        INSERT INTO scae_assessment_releases (
          id, "userId", "instrument", "state", "classId", "released_by_id",
          "expires_at", "createdAt", "updatedAt"
        )
        SELECT
          gen_random_uuid(),
          target_user.id,
          $1,
          'PENDING',
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
        ON CONFLICT DO NOTHING;
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

import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentPasswordHash =
  "$2b$04$rx46Idk.TlAD7PjiJWp0buaU9YxwhOpza2usFFhShbXazAUsfYTr2";

const developmentUsers = [
  {
    role: "STUDENT",
    name: "Aluno Desenvolvimento 1a4",
    email: null,
    registrationNumber: "2026001",
    birthDate: "2015-03-10",
    passwordHash: null,
    schoolInepCode: "35000001",
    municipalityIbgeCode: "3550308",
  },
  {
    role: "STUDENT",
    name: "Aluno Desenvolvimento 5a9",
    email: null,
    registrationNumber: "2026002",
    birthDate: "2012-07-22",
    passwordHash: null,
    schoolInepCode: "35000001",
    municipalityIbgeCode: "3550308",
  },
  {
    role: "TEACHER",
    name: "Professor Desenvolvimento",
    email: "professor@scae.dev",
    registrationNumber: null,
    birthDate: null,
    passwordHash: developmentPasswordHash,
    schoolInepCode: "35000001",
    municipalityIbgeCode: "3550308",
  },
  {
    role: "SCHOOL_MANAGER",
    name: "Gestor Escola Desenvolvimento",
    email: "gestor.escola@scae.dev",
    registrationNumber: null,
    birthDate: null,
    passwordHash: developmentPasswordHash,
    schoolInepCode: "35000001",
    municipalityIbgeCode: "3550308",
  },
  {
    role: "MUNICIPAL_MANAGER",
    name: "Gestor Municipal Desenvolvimento",
    email: "gestor.municipal@scae.dev",
    registrationNumber: null,
    birthDate: null,
    passwordHash: developmentPasswordHash,
    schoolInepCode: null,
    municipalityIbgeCode: "3550308",
  },
  {
    role: "ADMIN",
    name: "Admin Desenvolvimento",
    email: "admin@scae.dev",
    registrationNumber: null,
    birthDate: null,
    passwordHash: developmentPasswordHash,
    schoolInepCode: null,
    municipalityIbgeCode: null,
  },
];

seedDevelopmentUsers();

async function seedDevelopmentUsers() {
  await databaseClient.connect();

  for (const developmentUser of developmentUsers) {
    await insertDevelopmentUser(developmentUser);
  }

  await databaseClient.end();

  console.log(
    '> STUDENT (1a4):     matrícula "2026001" + nascimento "2015-03-10"',
  );
  console.log(
    '> STUDENT (5a9):     matrícula "2026002" + nascimento "2012-07-22"',
  );
  console.log('> TEACHER:           "professor@scae.dev" + "password"');
  console.log('> SCHOOL_MANAGER:    "gestor.escola@scae.dev" + "password"');
  console.log('> MUNICIPAL_MANAGER: "gestor.municipal@scae.dev" + "password"');
  console.log('> ADMIN:             "admin@scae.dev" + "password"');
}

async function insertDevelopmentUser(developmentUser) {
  try {
    const insertUserQuery = {
      text: `
        INSERT INTO scae_users (
          id,
          role,
          name,
          email,
          "registrationNumber",
          "birthDate",
          "passwordHash",
          "schoolId",
          "municipalityId",
          "createdAt",
          "updatedAt"
        )
        SELECT
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          school_reference.id,
          municipality_reference.id,
          NOW(),
          NOW()
        FROM (SELECT 1) anchor
        LEFT JOIN scae_schools school_reference ON school_reference."inep_code" = $7
        LEFT JOIN scae_municipalities municipality_reference ON municipality_reference."ibge_code" = $8
        ON CONFLICT DO NOTHING;
      `,
      values: [
        developmentUser.role,
        developmentUser.name,
        developmentUser.email,
        developmentUser.registrationNumber,
        developmentUser.birthDate,
        developmentUser.passwordHash,
        developmentUser.schoolInepCode,
        developmentUser.municipalityIbgeCode,
      ],
    };

    await databaseClient.query(insertUserQuery);
  } catch (insertError) {
    console.error(
      `> Failed to insert ${developmentUser.role}: ${insertError.message}`,
    );
  }
}

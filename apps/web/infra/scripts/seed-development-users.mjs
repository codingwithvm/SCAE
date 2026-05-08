import pg from "pg";

const { Client } = pg;

const databaseClient = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const developmentPasswordHash =
  "$2b$04$rx46Idk.TlAD7PjiJWp0buaU9YxwhOpza2usFFhShbXazAUsfYTr2";

const students1ano = [
  { reg: "2026101", name: "Ana Beatriz Silva", birth: "2019-02-14" },
  { reg: "2026102", name: "Lucas Gabriel Santos", birth: "2019-05-08" },
  { reg: "2026103", name: "Maria Eduarda Oliveira", birth: "2019-01-22" },
  { reg: "2026104", name: "Pedro Henrique Costa", birth: "2019-07-30" },
  { reg: "2026105", name: "Isabela Fernandes", birth: "2019-03-17" },
  { reg: "2026106", name: "Davi Luiz Pereira", birth: "2019-09-05" },
  { reg: "2026107", name: "Sofia Martins", birth: "2019-04-12" },
  { reg: "2026108", name: "Enzo Gabriel Almeida", birth: "2019-11-28" },
];

const students2ano = [
  { reg: "2026201", name: "Valentina Souza", birth: "2018-03-10" },
  { reg: "2026202", name: "Arthur Rodrigues", birth: "2018-06-25" },
  { reg: "2026203", name: "Helena Barbosa", birth: "2018-01-18" },
  { reg: "2026204", name: "Miguel Ferreira", birth: "2018-08-07" },
  { reg: "2026205", name: "Laura Azevedo", birth: "2018-04-22" },
  { reg: "2026206", name: "Bernardo Lima", birth: "2018-10-14" },
  { reg: "2026207", name: "Alice Ribeiro", birth: "2018-02-03" },
  { reg: "2026208", name: "Théo Cardoso", birth: "2018-12-19" },
];

const students3ano = [
  { reg: "2026301", name: "Manuela Araújo", birth: "2017-05-11" },
  { reg: "2026302", name: "Rafael Mendes", birth: "2017-02-28" },
  { reg: "2026303", name: "Cecília Gonçalves", birth: "2017-07-15" },
  { reg: "2026304", name: "Guilherme Nunes", birth: "2017-09-03" },
  { reg: "2026305", name: "Lívia Carvalho", birth: "2017-11-20" },
  { reg: "2026306", name: "Samuel Teixeira", birth: "2017-01-06" },
  { reg: "2026307", name: "Lara Moreira", birth: "2017-04-17" },
  { reg: "2026308", name: "Heitor Dias", birth: "2017-08-29" },
];

const students4ano = [
  { reg: "2026401", name: "Giovanna Castro", birth: "2016-06-13" },
  { reg: "2026402", name: "Lorenzo Vieira", birth: "2016-03-01" },
  { reg: "2026403", name: "Beatriz Correia", birth: "2016-10-24" },
  { reg: "2026404", name: "Nicolas Rocha", birth: "2016-01-15" },
  { reg: "2026405", name: "Antonella Pinto", birth: "2016-07-08" },
  { reg: "2026406", name: "Cauã Monteiro", birth: "2016-12-02" },
  { reg: "2026407", name: "Elisa Freitas", birth: "2016-04-19" },
  { reg: "2026408", name: "Benício Melo", birth: "2016-09-27" },
];

const students5ano = [
  { reg: "2026501", name: "Mariana Lopes", birth: "2015-03-10" },
  { reg: "2026502", name: "Gabriel Alves", birth: "2015-07-22" },
  { reg: "2026503", name: "Isadora Nascimento", birth: "2015-01-05" },
  { reg: "2026504", name: "Felipe Machado", birth: "2015-08-18" },
  { reg: "2026505", name: "Luísa Campos", birth: "2015-05-30" },
  { reg: "2026506", name: "Daniel Sousa", birth: "2015-11-12" },
  { reg: "2026507", name: "Clara Rezende", birth: "2015-02-25" },
  { reg: "2026508", name: "Matheus Borges", birth: "2015-10-07" },
  { reg: "2026509", name: "Júlia Farias", birth: "2015-06-14" },
];

const students6ano = [
  { reg: "2026601", name: "Letícia Moura", birth: "2014-04-20" },
  { reg: "2026602", name: "Gustavo Duarte", birth: "2014-01-09" },
  { reg: "2026603", name: "Camila Ramos", birth: "2014-09-16" },
  { reg: "2026604", name: "Vinícius Fonseca", birth: "2014-06-03" },
  { reg: "2026605", name: "Larissa Cunha", birth: "2014-11-28" },
  { reg: "2026606", name: "Bryan Tavares", birth: "2014-03-14" },
  { reg: "2026607", name: "Melissa Andrade", birth: "2014-08-07" },
  { reg: "2026608", name: "Caio Silveira", birth: "2014-12-22" },
];

const students7ano = [
  { reg: "2026701", name: "Fernanda Batista", birth: "2013-02-11" },
  { reg: "2026702", name: "João Pedro Amaral", birth: "2013-05-26" },
  { reg: "2026703", name: "Gabriela Paixão", birth: "2013-10-03" },
  { reg: "2026704", name: "Leonardo Coelho", birth: "2013-07-19" },
  { reg: "2026705", name: "Bianca Nogueira", birth: "2013-01-30" },
  { reg: "2026706", name: "Thiago Cavalcanti", birth: "2013-04-15" },
  { reg: "2026707", name: "Nicole Siqueira", birth: "2013-09-08" },
  { reg: "2026708", name: "Ryan Guimarães", birth: "2013-12-01" },
];

const students8ano = [
  { reg: "2026801", name: "Amanda Prado", birth: "2012-06-17" },
  { reg: "2026802", name: "Kauan Medeiros", birth: "2012-03-04" },
  { reg: "2026803", name: "Yasmin Teles", birth: "2012-08-21" },
  { reg: "2026804", name: "Erick Barros", birth: "2012-11-10" },
  { reg: "2026805", name: "Carolina Brito", birth: "2012-01-23" },
  { reg: "2026806", name: "Murilo Assis", birth: "2012-05-06" },
  { reg: "2026807", name: "Rebeca Paiva", birth: "2012-09-29" },
  { reg: "2026808", name: "Igor Sampaio", birth: "2012-02-14" },
];

const students9ano = [
  { reg: "2026901", name: "Raquel Viana", birth: "2011-07-12" },
  { reg: "2026902", name: "Lucas Henrique Pires", birth: "2011-04-05" },
  { reg: "2026903", name: "Natália Pacheco", birth: "2011-10-18" },
  { reg: "2026904", name: "Otávio Brandão", birth: "2011-02-27" },
  { reg: "2026905", name: "Vitória Leal", birth: "2011-06-09" },
  { reg: "2026906", name: "Henrique Esteves", birth: "2011-12-15" },
  { reg: "2026907", name: "Aline Magalhães", birth: "2011-08-03" },
  { reg: "2026908", name: "Bruno Figueiredo", birth: "2011-03-20" },
];

const allStudents = [
  ...students1ano,
  ...students2ano,
  ...students3ano,
  ...students4ano,
  ...students5ano,
  ...students6ano,
  ...students7ano,
  ...students8ano,
  ...students9ano,
];

const developmentUsers = [
  ...allStudents.map((s) => ({
    role: "STUDENT",
    name: s.name,
    email: null,
    registrationNumber: s.reg,
    birthDate: s.birth,
    passwordHash: null,
    schoolInepCode: "35000001",
    municipalityIbgeCode: "3550308",
  })),
  {
    role: "TEACHER",
    name: "Cláudia Regina Monteiro",
    email: "professor@scae.dev",
    registrationNumber: null,
    birthDate: null,
    passwordHash: developmentPasswordHash,
    schoolInepCode: "35000001",
    municipalityIbgeCode: "3550308",
  },
  {
    role: "TEACHER",
    name: "Ricardo de Souza Lima",
    email: "professor2@scae.dev",
    registrationNumber: null,
    birthDate: null,
    passwordHash: developmentPasswordHash,
    schoolInepCode: "35000001",
    municipalityIbgeCode: "3550308",
  },
  {
    role: "SCHOOL_MANAGER",
    name: "Sandra Maria Oliveira",
    email: "gestor.escola@scae.dev",
    registrationNumber: null,
    birthDate: null,
    passwordHash: developmentPasswordHash,
    schoolInepCode: "35000001",
    municipalityIbgeCode: "3550308",
  },
  {
    role: "MUNICIPAL_MANAGER",
    name: "Carlos Eduardo Ferreira",
    email: "gestor.municipal@scae.dev",
    registrationNumber: null,
    birthDate: null,
    passwordHash: developmentPasswordHash,
    schoolInepCode: null,
    municipalityIbgeCode: "3550308",
  },
  {
    role: "ADMIN",
    name: "Marcos Antônio Ribeiro",
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

  console.log(`> ${allStudents.length} students seeded across 9 classes`);
  console.log("> Sample logins:");
  console.log(
    '  STUDENT (1º Ano): matrícula "2026101" + nascimento "2019-02-14"',
  );
  console.log(
    '  STUDENT (5º Ano): matrícula "2026501" + nascimento "2015-03-10"',
  );
  console.log(
    '  STUDENT (9º Ano): matrícula "2026901" + nascimento "2011-07-12"',
  );
  console.log('  TEACHER 1:        "professor@scae.dev" + "password"');
  console.log('  TEACHER 2:        "professor2@scae.dev" + "password"');
  console.log('  SCHOOL_MANAGER:   "gestor.escola@scae.dev" + "password"');
  console.log('  MUNICIPAL_MANAGER:"gestor.municipal@scae.dev" + "password"');
  console.log('  ADMIN:            "admin@scae.dev" + "password"');
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
        WHERE NOT EXISTS (
          SELECT 1 FROM scae_users u
          WHERE (u.email = $3 AND $3 IS NOT NULL)
             OR (u."registrationNumber" = $4 AND $4 IS NOT NULL)
        );
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

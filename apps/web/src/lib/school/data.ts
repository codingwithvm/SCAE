export type MceesMcProfileName =
  | "Criativo"
  | "Analítico"
  | "Estrategista"
  | "Prático";

export type AssessmentStatus = "Completo" | "Pendente";

export interface SchoolClass {
  id: string;
  name: string;
  year: string;
  shift: "Manhã" | "Tarde" | "Integral";
  teacher: string;
  studentCount: number;
}

export interface SchoolTeacher {
  id: string;
  name: string;
  email: string;
  classCount: number;
  mcees: AssessmentStatus;
  mees: AssessmentStatus;
}

export interface SchoolStudent {
  id: string;
  name: string;
  registration: string;
  className: string;
  birthDate: string;
  profile: MceesMcProfileName | null;
}

export const SCHOOL_NAME = "Escola Municipal Prof. João Santos";

export const MOCK_CLASSES: SchoolClass[] = [
  {
    id: "1",
    name: "Turma A",
    year: "3º ano",
    shift: "Manhã",
    teacher: "Ana Santos",
    studentCount: 25,
  },
  {
    id: "2",
    name: "Turma B",
    year: "3º ano",
    shift: "Tarde",
    teacher: "Carlos Lima",
    studentCount: 28,
  },
  {
    id: "3",
    name: "Turma C",
    year: "4º ano",
    shift: "Manhã",
    teacher: "Beatriz Rocha",
    studentCount: 30,
  },
  {
    id: "4",
    name: "Turma D",
    year: "4º ano",
    shift: "Tarde",
    teacher: "Fernando Melo",
    studentCount: 27,
  },
  {
    id: "5",
    name: "Turma E",
    year: "5º ano",
    shift: "Manhã",
    teacher: "Juliana Costa",
    studentCount: 32,
  },
  {
    id: "6",
    name: "Turma F",
    year: "5º ano",
    shift: "Tarde",
    teacher: "Roberto Alves",
    studentCount: 29,
  },
  {
    id: "7",
    name: "Turma G",
    year: "6º ano",
    shift: "Manhã",
    teacher: "Patrícia Nunes",
    studentCount: 33,
  },
  {
    id: "8",
    name: "Turma H",
    year: "6º ano",
    shift: "Tarde",
    teacher: "Marcos Faria",
    studentCount: 31,
  },
  {
    id: "9",
    name: "Turma I",
    year: "7º ano",
    shift: "Manhã",
    teacher: "Camila Teixeira",
    studentCount: 26,
  },
  {
    id: "10",
    name: "Turma J",
    year: "7º ano",
    shift: "Tarde",
    teacher: "Diego Souza",
    studentCount: 28,
  },
  {
    id: "11",
    name: "Turma K",
    year: "8º ano",
    shift: "Manhã",
    teacher: "Lara Mendes",
    studentCount: 24,
  },
  {
    id: "12",
    name: "Turma L",
    year: "9º ano",
    shift: "Integral",
    teacher: "Rodrigo Pinto",
    studentCount: 29,
  },
];

export const MOCK_TEACHERS: SchoolTeacher[] = [
  {
    id: "1",
    name: "Ana Santos",
    email: "ana@escola.edu.br",
    classCount: 2,
    mcees: "Completo",
    mees: "Completo",
  },
  {
    id: "2",
    name: "Carlos Lima",
    email: "carlos@escola.edu.br",
    classCount: 1,
    mcees: "Completo",
    mees: "Pendente",
  },
  {
    id: "3",
    name: "Beatriz Rocha",
    email: "beatriz@escola.edu.br",
    classCount: 2,
    mcees: "Pendente",
    mees: "Pendente",
  },
  {
    id: "4",
    name: "Fernando Melo",
    email: "fernando@escola.edu.br",
    classCount: 1,
    mcees: "Completo",
    mees: "Completo",
  },
  {
    id: "5",
    name: "Juliana Costa",
    email: "juliana@escola.edu.br",
    classCount: 2,
    mcees: "Completo",
    mees: "Pendente",
  },
  {
    id: "6",
    name: "Roberto Alves",
    email: "roberto@escola.edu.br",
    classCount: 1,
    mcees: "Pendente",
    mees: "Pendente",
  },
  {
    id: "7",
    name: "Patrícia Nunes",
    email: "patricia@escola.edu.br",
    classCount: 2,
    mcees: "Completo",
    mees: "Completo",
  },
  {
    id: "8",
    name: "Marcos Faria",
    email: "marcos@escola.edu.br",
    classCount: 1,
    mcees: "Completo",
    mees: "Completo",
  },
  {
    id: "9",
    name: "Camila Teixeira",
    email: "camila@escola.edu.br",
    classCount: 2,
    mcees: "Pendente",
    mees: "Pendente",
  },
  {
    id: "10",
    name: "Diego Souza",
    email: "diego@escola.edu.br",
    classCount: 1,
    mcees: "Completo",
    mees: "Pendente",
  },
  {
    id: "11",
    name: "Lara Mendes",
    email: "lara@escola.edu.br",
    classCount: 1,
    mcees: "Completo",
    mees: "Completo",
  },
  {
    id: "12",
    name: "Rodrigo Pinto",
    email: "rodrigo@escola.edu.br",
    classCount: 1,
    mcees: "Pendente",
    mees: "Pendente",
  },
  {
    id: "13",
    name: "Fernanda Dias",
    email: "fernanda@escola.edu.br",
    classCount: 0,
    mcees: "Pendente",
    mees: "Pendente",
  },
  {
    id: "14",
    name: "Gustavo Moura",
    email: "gustavo@escola.edu.br",
    classCount: 0,
    mcees: "Completo",
    mees: "Pendente",
  },
  {
    id: "15",
    name: "Isabela Cruz",
    email: "isabela@escola.edu.br",
    classCount: 0,
    mcees: "Completo",
    mees: "Completo",
  },
  {
    id: "16",
    name: "Leonardo Braga",
    email: "leonardo@escola.edu.br",
    classCount: 0,
    mcees: "Pendente",
    mees: "Pendente",
  },
  {
    id: "17",
    name: "Marina Viana",
    email: "marina@escola.edu.br",
    classCount: 0,
    mcees: "Completo",
    mees: "Completo",
  },
  {
    id: "18",
    name: "Nilton Ramos",
    email: "nilton@escola.edu.br",
    classCount: 0,
    mcees: "Pendente",
    mees: "Pendente",
  },
];

const PROFILES: (MceesMcProfileName | null)[] = [
  "Criativo",
  "Analítico",
  "Estrategista",
  "Prático",
  "Criativo",
  "Analítico",
  null,
  "Prático",
  "Estrategista",
  "Criativo",
];

export const MOCK_STUDENTS: SchoolStudent[] = Array.from(
  { length: 342 },
  (_, i) => ({
    id: String(i + 1),
    name: [
      "Ana Souza",
      "Bruno Lima",
      "Carla Melo",
      "Daniel Costa",
      "Eduarda Rocha",
      "Felipe Nunes",
      "Gabriela Faria",
      "Henrique Dias",
      "Isabela Alves",
      "João Mendes",
    ][i % 10],
    registration: `2024${String(i + 1).padStart(4, "0")}`,
    className: MOCK_CLASSES[i % MOCK_CLASSES.length].name,
    birthDate: `${String((i % 28) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/2013`,
    profile: PROFILES[i % PROFILES.length],
  }),
);

export function getSchoolMetrics() {
  const totalClasses = MOCK_CLASSES.length;
  const totalTeachers = MOCK_TEACHERS.length;
  const totalStudents = MOCK_STUDENTS.length;
  const assessedStudents = MOCK_STUDENTS.filter(
    (s) => s.profile !== null,
  ).length;
  const assessedPercent = Math.round((assessedStudents / totalStudents) * 100);

  return { totalClasses, totalTeachers, totalStudents, assessedPercent };
}

export function getProfileDistribution(): Record<MceesMcProfileName, number> {
  const counts: Record<MceesMcProfileName, number> = {
    Criativo: 0,
    Analítico: 0,
    Estrategista: 0,
    Prático: 0,
  };
  MOCK_STUDENTS.forEach((s) => {
    if (s.profile) counts[s.profile]++;
  });
  return counts;
}

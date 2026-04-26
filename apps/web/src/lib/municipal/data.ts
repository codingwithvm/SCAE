// Mock data for the municipal manager area

export const MUNICIPALITY_NAME = "Município de São José dos Campos";
export const MUNICIPAL_MANAGER_NAME = "Carlos Mendes";

export interface MunicipalSchool {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  classes: number;
  teachers: number;
  students: number;
  participationPct: number;
}

export interface MunicipalMetrics {
  totalSchools: number;
  totalClasses: number;
  totalTeachers: number;
  totalStudents: number;
  assessedStudentsPct: number;
  gscaeActivities: number;
}

export const MOCK_MUNICIPAL_SCHOOLS: MunicipalSchool[] = [
  {
    id: "sc1",
    name: "E.M. Prof. João Santos",
    address: "Rua das Flores, 123 — Centro",
    phone: "(12) 3901-1111",
    email: "joaosantos@educacao.sjc.sp.gov.br",
    classes: 12,
    teachers: 18,
    students: 380,
    participationPct: 95,
  },
  {
    id: "sc2",
    name: "E.M. Maria Montessori",
    address: "Av. Brasil, 456 — Jardim América",
    phone: "(12) 3901-2222",
    email: "montessori@educacao.sjc.sp.gov.br",
    classes: 10,
    teachers: 15,
    students: 310,
    participationPct: 87,
  },
  {
    id: "sc3",
    name: "E.M. Paulo Freire",
    address: "Rua da Educação, 789 — Vila Nova",
    phone: "(12) 3901-3333",
    email: "paulofreire@educacao.sjc.sp.gov.br",
    classes: 9,
    teachers: 14,
    students: 290,
    participationPct: 72,
  },
  {
    id: "sc4",
    name: "E.M. Cecília Meireles",
    address: "Av. da Cultura, 321 — Bom Retiro",
    phone: "(12) 3901-4444",
    email: "ceciliameireles@educacao.sjc.sp.gov.br",
    classes: 8,
    teachers: 12,
    students: 250,
    participationPct: 68,
  },
  {
    id: "sc5",
    name: "E.M. Anísio Teixeira",
    address: "Rua do Saber, 654 — Jardim Sul",
    phone: "(12) 3901-5555",
    email: "anisioteixeira@educacao.sjc.sp.gov.br",
    classes: 7,
    teachers: 11,
    students: 220,
    participationPct: 54,
  },
];

export function getMunicipalMetrics(): MunicipalMetrics {
  return {
    totalSchools: MOCK_MUNICIPAL_SCHOOLS.length,
    totalClasses: MOCK_MUNICIPAL_SCHOOLS.reduce((a, s) => a + s.classes, 0),
    totalTeachers: MOCK_MUNICIPAL_SCHOOLS.reduce((a, s) => a + s.teachers, 0),
    totalStudents: MOCK_MUNICIPAL_SCHOOLS.reduce((a, s) => a + s.students, 0),
    assessedStudentsPct: 78,
    gscaeActivities: 324,
  };
}

export const MUNICIPAL_PROFILE_DISTRIBUTION: Record<string, number> = {
  Criativo: 32,
  Analítico: 28,
  Estrategista: 22,
  Prático: 18,
};

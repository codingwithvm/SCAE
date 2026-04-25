import { type ProfileName } from "@/lib/quiz/profile";

export interface Student {
  id: number;
  name: string;
  registrationNumber: string;
  profile: ProfileName | null;
  assessmentStatus: "Completo" | "Pendente";
}

export interface TeacherClass {
  id: number;
  name: string;
  grade: string;
  totalStudents: number;
  assessedStudents: number;
  students: Student[];
}

export const MOCK_CLASSES: TeacherClass[] = [
  {
    id: 1,
    name: "Turma A",
    grade: "3º ano",
    totalStudents: 28,
    assessedStudents: 20,
    students: [
      {
        id: 1,
        name: "Ana Clara Silva",
        registrationNumber: "20240001",
        profile: "Criativo",
        assessmentStatus: "Completo",
      },
      {
        id: 2,
        name: "Carlos Eduardo",
        registrationNumber: "20240002",
        profile: "Analítico",
        assessmentStatus: "Completo",
      },
      {
        id: 3,
        name: "Isabela Ferreira",
        registrationNumber: "20240003",
        profile: "Criativo",
        assessmentStatus: "Completo",
      },
      {
        id: 4,
        name: "João Pedro",
        registrationNumber: "20240004",
        profile: "Analítico",
        assessmentStatus: "Completo",
      },
      {
        id: 5,
        name: "Gabriela Santos",
        registrationNumber: "20240005",
        profile: "Analítico",
        assessmentStatus: "Completo",
      },
      {
        id: 6,
        name: "Pedro Henrique",
        registrationNumber: "20240006",
        profile: "Estrategista",
        assessmentStatus: "Completo",
      },
      {
        id: 7,
        name: "Larissa Oliveira",
        registrationNumber: "20240007",
        profile: "Estrategista",
        assessmentStatus: "Completo",
      },
      {
        id: 8,
        name: "Rafael Costa",
        registrationNumber: "20240008",
        profile: "Prático",
        assessmentStatus: "Completo",
      },
      {
        id: 9,
        name: "Beatriz Lima",
        registrationNumber: "20240009",
        profile: "Prático",
        assessmentStatus: "Completo",
      },
      {
        id: 10,
        name: "Thiago Alves",
        registrationNumber: "20240010",
        profile: "Prático",
        assessmentStatus: "Completo",
      },
      {
        id: 11,
        name: "Fernanda Rocha",
        registrationNumber: "20240011",
        profile: "Criativo",
        assessmentStatus: "Completo",
      },
      {
        id: 12,
        name: "Mateus Carvalho",
        registrationNumber: "20240012",
        profile: "Criativo",
        assessmentStatus: "Completo",
      },
      {
        id: 13,
        name: "Juliana Nunes",
        registrationNumber: "20240013",
        profile: "Analítico",
        assessmentStatus: "Completo",
      },
      {
        id: 14,
        name: "Lucas Martins",
        registrationNumber: "20240014",
        profile: null,
        assessmentStatus: "Pendente",
      },
      {
        id: 15,
        name: "Maria Eduarda",
        registrationNumber: "20240015",
        profile: null,
        assessmentStatus: "Pendente",
      },
      {
        id: 16,
        name: "Vinícius Souza",
        registrationNumber: "20240016",
        profile: "Criativo",
        assessmentStatus: "Completo",
      },
      {
        id: 17,
        name: "Camila Torres",
        registrationNumber: "20240017",
        profile: "Estrategista",
        assessmentStatus: "Completo",
      },
      {
        id: 18,
        name: "Diego Mendes",
        registrationNumber: "20240018",
        profile: null,
        assessmentStatus: "Pendente",
      },
      {
        id: 19,
        name: "Aline Ribeiro",
        registrationNumber: "20240019",
        profile: "Analítico",
        assessmentStatus: "Completo",
      },
      {
        id: 20,
        name: "Bruno Freitas",
        registrationNumber: "20240020",
        profile: "Criativo",
        assessmentStatus: "Completo",
      },
      {
        id: 21,
        name: "Sabrina Castro",
        registrationNumber: "20240021",
        profile: null,
        assessmentStatus: "Pendente",
      },
      {
        id: 22,
        name: "Henrique Dias",
        registrationNumber: "20240022",
        profile: "Estrategista",
        assessmentStatus: "Completo",
      },
      {
        id: 23,
        name: "Natalia Gomes",
        registrationNumber: "20240023",
        profile: null,
        assessmentStatus: "Pendente",
      },
      {
        id: 24,
        name: "Felipe Barbosa",
        registrationNumber: "20240024",
        profile: "Prático",
        assessmentStatus: "Completo",
      },
      {
        id: 25,
        name: "Priscila Moura",
        registrationNumber: "20240025",
        profile: null,
        assessmentStatus: "Pendente",
      },
      {
        id: 26,
        name: "Rodrigo Pinto",
        registrationNumber: "20240026",
        profile: "Criativo",
        assessmentStatus: "Completo",
      },
      {
        id: 27,
        name: "Tânia Correia",
        registrationNumber: "20240027",
        profile: null,
        assessmentStatus: "Pendente",
      },
      {
        id: 28,
        name: "Marcelo Farias",
        registrationNumber: "20240028",
        profile: null,
        assessmentStatus: "Pendente",
      },
    ],
  },
  {
    id: 2,
    name: "Turma B",
    grade: "5º ano",
    totalStudents: 32,
    assessedStudents: 25,
    students: [],
  },
];

export const PROFILE_COLORS: Record<ProfileName, string> = {
  Criativo: "#F6AD55",
  Analítico: "#63B3ED",
  Estrategista: "#68D391",
  Prático: "#FC8181",
};

export const PROFILE_BAR_COLORS: Record<ProfileName, string> = {
  Criativo: "#27B7D8",
  Analítico: "#3182CE",
  Estrategista: "#ECC94B",
  Prático: "#38A169",
};

export function getProfileDistribution(
  students: Student[],
): Record<ProfileName, Student[]> {
  const assessed = students.filter((s) => s.profile !== null);
  return {
    Criativo: assessed.filter((s) => s.profile === "Criativo"),
    Analítico: assessed.filter((s) => s.profile === "Analítico"),
    Estrategista: assessed.filter((s) => s.profile === "Estrategista"),
    Prático: assessed.filter((s) => s.profile === "Prático"),
  };
}

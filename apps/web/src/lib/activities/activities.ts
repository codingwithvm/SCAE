import { type ProfileName } from "@/lib/quiz/profile";

export type ActivityDifficulty = "Fácil" | "Médio" | "Difícil";
export type ActivityStatus = "Nova" | "Em andamento" | "Concluída";
export type ActivityCategory =
  | "Narrativa"
  | "Arte Digital"
  | "Matemática"
  | "Ciências"
  | "Música"
  | "Leitura";

export interface Activity {
  id: number;
  title: string;
  category: ActivityCategory;
  difficulty: ActivityDifficulty;
  status: ActivityStatus;
  iconName: string;
  thumbColor: string;
  iconColor: string;
  profiles: ProfileName[];
  completedAt?: string;
  score?: number;
}

export interface HistoryEntry {
  id: number;
  activityId: number;
  title: string;
  difficulty: ActivityDifficulty;
  status: ActivityStatus;
  iconName: string;
  thumbColor: string;
  iconColor: string;
  date: string;
  score?: number;
}

export const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: 1,
    activityId: 1,
    title: "Crie sua História",
    difficulty: "Fácil",
    status: "Concluída",
    iconName: "palette",
    thumbColor: "#DBEAFE",
    iconColor: "#3B82F6",
    date: "Concluída em 10/04/2026",
    score: 92,
  },
  {
    id: 2,
    activityId: 2,
    title: "Compondo Melodias",
    difficulty: "Médio",
    status: "Em andamento",
    iconName: "music",
    thumbColor: "#D1FAE5",
    iconColor: "#10B981",
    date: "Iniciada em 08/04/2026",
  },
  {
    id: 3,
    activityId: 3,
    title: "Desenho Livre",
    difficulty: "Difícil",
    status: "Concluída",
    iconName: "pen-tool",
    thumbColor: "#FEE2E2",
    iconColor: "#EF4444",
    date: "Concluída em 05/04/2026",
    score: 84,
  },
  {
    id: 4,
    activityId: 4,
    title: "Aventura Literária",
    difficulty: "Médio",
    status: "Concluída",
    iconName: "book-open",
    thumbColor: "#FEF3C7",
    iconColor: "#D97706",
    date: "Concluída em 01/04/2026",
    score: 88,
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: "Crie sua História",
    category: "Narrativa",
    difficulty: "Fácil",
    status: "Nova",
    iconName: "palette",
    thumbColor: "#DBEAFE",
    iconColor: "#3B82F6",
    profiles: ["Criativo"],
  },
  {
    id: 2,
    title: "Compondo Melodias",
    category: "Música",
    difficulty: "Médio",
    status: "Em andamento",
    iconName: "music",
    thumbColor: "#D1FAE5",
    iconColor: "#10B981",
    profiles: ["Criativo", "Analítico"],
  },
  {
    id: 3,
    title: "Desafio de Lógica",
    category: "Matemática",
    difficulty: "Difícil",
    status: "Nova",
    iconName: "brain",
    thumbColor: "#EDE9FE",
    iconColor: "#7C3AED",
    profiles: ["Analítico", "Estrategista"],
  },
  {
    id: 4,
    title: "Experimento Científico",
    category: "Ciências",
    difficulty: "Médio",
    status: "Concluída",
    iconName: "flask-conical",
    thumbColor: "#FEF3C7",
    iconColor: "#D97706",
    profiles: ["Prático", "Estrategista"],
  },
  {
    id: 5,
    title: "Arte em Pixels",
    category: "Arte Digital",
    difficulty: "Fácil",
    status: "Nova",
    iconName: "image",
    thumbColor: "#FCE7F3",
    iconColor: "#DB2777",
    profiles: ["Criativo"],
  },
  {
    id: 6,
    title: "Leitura Dinâmica",
    category: "Leitura",
    difficulty: "Fácil",
    status: "Em andamento",
    iconName: "book-open",
    thumbColor: "#ECFDF5",
    iconColor: "#059669",
    profiles: ["Analítico", "Prático"],
  },
];

export const DIFFICULTY_OPTIONS: ActivityDifficulty[] = [
  "Fácil",
  "Médio",
  "Difícil",
];
export const CATEGORY_OPTIONS: ActivityCategory[] = [
  "Narrativa",
  "Arte Digital",
  "Matemática",
  "Ciências",
  "Música",
  "Leitura",
];
export const STATUS_OPTIONS: ActivityStatus[] = [
  "Nova",
  "Em andamento",
  "Concluída",
];

export const DIFFICULTY_BADGE_VARIANT: Record<
  ActivityDifficulty,
  "success" | "warning" | "error"
> = {
  Fácil: "success",
  Médio: "warning",
  Difícil: "error",
};

export const STATUS_BADGE_VARIANT: Record<
  ActivityStatus,
  "primary" | "info" | "success"
> = {
  Nova: "primary",
  "Em andamento": "info",
  Concluída: "success",
};

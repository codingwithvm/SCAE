export type Dimension = "CA" | "EC" | "EA" | "OR";

export type Instrument = "mcees_1a4" | "mcees_5a9" | "mcees_prof" | "mees_prof";

export interface BlockItem {
  d: Dimension;
  t: string;
}

export interface Block {
  b: number;
  title: string;
  items: BlockItem[];
}

export interface PairOption {
  d: Dimension;
  t: string;
}

export interface Pair {
  n: number;
  A: PairOption;
  B: PairOption;
}

export interface MEESSection {
  s: number;
  title: string;
  pairs: Pair[];
}

export interface ExtraPair {
  A: PairOption;
  B: PairOption;
}

export type RankingsMap = Record<string, Record<Dimension, number>>;

export type MEESAnswers = Record<string, "A" | "B">;

export type Axis = "X" | "Y";

export type StudentProfile =
  | "Estrategista"
  | "Analítico"
  | "Criativo"
  | "Prático"
  | "Equilibrado";

export type TeacherProfile =
  | "Avaliador"
  | "Especialista"
  | "Mentor"
  | "Facilitador"
  | "Equilibrado";

export type Profile = StudentProfile | TeacherProfile;

export type ConsistencyTier = "Confirmado" | "Predominante" | "Em Mapeamento";

export interface ScoreResult {
  dimensions: Record<Dimension, number>;
  X: number;
  Y: number;
  conf: number;
  confX: number;
  confY: number;
}

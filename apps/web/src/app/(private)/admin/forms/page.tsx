import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface FormCard {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  questions: number;
  alternatives: number;
}

const FORM_CARDS: FormCard[] = [
  {
    id: "grade1to4",
    title: "Alunos 1º ao 4º ano",
    type: "GRADE1_TO_4",
    questions: 16,
    alternatives: 4,
  },
  {
    id: "grade5to9",
    title: "Alunos 5º ao 9º ano",
    type: "GRADE5_TO_9",
    questions: 16,
    alternatives: 4,
  },
  {
    id: "teacherMcees",
    title: "Professor MCEES",
    subtitle: "Estilo de aprendizagem",
    type: "TEACHER_MCEES",
    questions: 16,
    alternatives: 2,
  },
  {
    id: "teacherMees",
    title: "Professor MEES",
    subtitle: "Estilo de ensino",
    type: "TEACHER_MEES",
    questions: 16,
    alternatives: 2,
  },
];

export default function AdminFormsPage() {
  const rows = [FORM_CARDS.slice(0, 2), FORM_CARDS.slice(2, 4)];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title */}
      <h1 className="text-2xl font-bold text-text-primary font-[--font-poppins]">
        Formulários de avaliação
      </h1>

      {/* Grid 2×2 */}
      <div className="flex flex-col gap-4">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-4">
            {row.map((card) => (
              <div
                key={card.id}
                className="flex-1 flex flex-col gap-3 rounded-2xl border border-border-light bg-background p-5 shadow-[0_2px_8px_var(--shadow-color)]"
              >
                {/* Title */}
                <p className="text-base font-semibold text-text-primary font-[--font-poppins]">
                  {card.title}
                </p>

                {/* Subtitle (optional) */}
                {card.subtitle && (
                  <p className="text-xs text-text-secondary font-[--font-inter]">
                    {card.subtitle}
                  </p>
                )}

                {/* Type */}
                <p className="text-sm text-text-secondary font-[--font-inter]">
                  Tipo: {card.type}
                </p>

                {/* Info row */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-text-primary font-[--font-inter]">
                    Questões: {card.questions}
                  </span>
                  <span className="text-sm font-medium text-text-primary font-[--font-inter]">
                    Alternativas: {card.alternatives}
                  </span>
                </div>

                {/* Status badge */}
                <Badge variant="success">Ativo</Badge>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    Editar questões
                  </Button>
                  <Button variant="destructive" size="sm">
                    Desativar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

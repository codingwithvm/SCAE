"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RankingBlock } from "@/components/assessment/RankingBlock";
import { PairChoice } from "@/components/assessment/PairChoice";
import type {
  Instrument,
  Dimension,
  Block,
  MEESSection,
  ExtraPair,
} from "@/lib/assessment/types";

const VALID_INSTRUMENTS = new Set<string>([
  "mcees_1a4",
  "mcees_5a9",
  "mcees_prof",
  "mees_prof",
]);

const INSTRUMENT_LABELS: Record<Instrument, string> = {
  mcees_1a4: "MCEES — 1º ao 4º ano",
  mcees_5a9: "MCEES — 5º ao 9º ano",
  mcees_prof: "MCEES — Professor",
  mees_prof: "MEES — Professor",
};

const STORAGE_KEY = "assessment_state";

interface InstrumentData {
  blocks?: Block[];
  sections?: MEESSection[];
  extraX: ExtraPair[];
  extraY: ExtraPair[];
}

interface SavedState {
  instrument: Instrument;
  releaseId: string | null;
  blockIndex: number;
  blockRanks: Record<string, Record<Dimension, number | null>>;
  meesAnswers: Record<string, "A" | "B">;
}

interface PageProps {
  params: Promise<{ instrument: string }>;
}

export default function AssessmentPage({ params }: PageProps) {
  const { instrument: rawInstrument } = use(params);
  const router = useRouter();

  if (!VALID_INSTRUMENTS.has(rawInstrument)) {
    return (
      <div className="flex flex-col min-h-screen bg-surface items-center justify-center">
        <p className="text-text-secondary font-(family-name:--font-inter)]">
          Instrumento inválido
        </p>
      </div>
    );
  }

  return (
    <AssessmentFlow instrument={rawInstrument as Instrument} router={router} />
  );
}

function AssessmentFlow({
  instrument,
  router,
}: {
  instrument: Instrument;
  router: ReturnType<typeof useRouter>;
}) {
  const isMCEES = instrument !== "mees_prof";
  const dbInstrument = instrument.toUpperCase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InstrumentData | null>(null);
  const [releaseId, setReleaseId] = useState<string | null>(null);

  const [blockIndex, setBlockIndex] = useState(0);
  const [blockRanks, setBlockRanks] = useState<
    Record<string, Record<Dimension, number | null>>
  >({});
  const [meesAnswers, setMeesAnswers] = useState<Record<string, "A" | "B">>({});

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SavedState;
        if (parsed.instrument === instrument) {
          setBlockIndex(parsed.blockIndex);
          setBlockRanks(parsed.blockRanks);
          setMeesAnswers(parsed.meesAnswers);
          if (parsed.releaseId) setReleaseId(parsed.releaseId);
        }
      } catch {
        /* noop */
      }
    }

    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    fetch("/api/v1/assessments/verify", {
      method: "POST",
      headers,
      body: JSON.stringify({ instrument: dbInstrument }),
    })
      .then((res) => res.json())
      .then(
        (verifyData: {
          allowed: boolean;
          releaseId?: string;
          instrument?: string;
        }) => {
          if (!verifyData.allowed || !verifyData.releaseId) {
            setError(
              "Você não tem uma avaliação liberada para este instrumento",
            );
            setLoading(false);
            return;
          }

          setReleaseId(verifyData.releaseId);

          return fetch(
            `/api/v1/assessments/questions?instrument=${instrument}`,
            { headers },
          );
        },
      )
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Erro ao carregar questões");
        return res.json();
      })
      .then((json?: InstrumentData) => {
        if (json) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Não foi possível carregar as questões");
        setLoading(false);
      });
  }, [instrument, dbInstrument]);

  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          instrument,
          releaseId,
          blockIndex,
          blockRanks,
          meesAnswers,
        }),
      );
    }
  }, [instrument, blockIndex, blockRanks, meesAnswers, releaseId, loading]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col min-h-screen bg-surface items-center justify-center gap-4">
        <p className="text-error font-(family-name:--font-inter)]">
          {error ?? "Erro desconhecido"}
        </p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    );
  }

  const totalBlocks = isMCEES
    ? (data.blocks?.length ?? 0)
    : (data.sections?.length ?? 0);

  const isFirst = blockIndex === 0;
  const isLast = blockIndex === totalBlocks - 1;

  const blockKey = `b${blockIndex}`;
  const currentRanks: Record<Dimension, number | null> = blockRanks[
    blockKey
  ] ?? {
    CA: null,
    EC: null,
    EA: null,
    OR: null,
  };
  const isBlockComplete = Object.values(currentRanks).every((r) => r !== null);

  const currentSection = !isMCEES ? data.sections?.[blockIndex] : null;
  const currentBlock = isMCEES ? data.blocks?.[blockIndex] : null;

  const sectionPairCount = currentSection?.pairs.length ?? 0;
  const sectionAnsweredCount = currentSection
    ? currentSection.pairs.filter((p) => meesAnswers[`p${p.n}`]).length
    : 0;
  const isSectionComplete = sectionAnsweredCount === sectionPairCount;

  const canAdvance = isMCEES ? isBlockComplete : isSectionComplete;

  const progressPercent = Math.round((blockIndex / totalBlocks) * 100);

  const progressLabel = isMCEES
    ? `Bloco ${blockIndex + 1} de ${totalBlocks}`
    : `Seção ${blockIndex + 1} de ${totalBlocks}`;

  const progressDetail = !isMCEES
    ? `${sectionAnsweredCount}/${sectionPairCount} pares`
    : undefined;

  function handleNext() {
    if (isLast) {
      sessionStorage.removeItem(STORAGE_KEY);
      router.push("/dashboard");
      return;
    }
    setBlockIndex((i) => i + 1);
  }

  function handlePrevious() {
    if (isFirst) return;
    setBlockIndex((i) => i - 1);
  }

  function handleSaveAndExit() {
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold text-text-primary font-(family-name:--font-poppins)]">
            {INSTRUMENT_LABELS[instrument]}
          </span>
          <span className="text-xs text-text-secondary font-(family-name:--font-inter)]">
            {progressLabel}
            {progressDetail ? ` · ${progressDetail}` : ""}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveAndExit}
          className="flex items-center gap-2"
        >
          <LogOut size={16} aria-hidden="true" />
          Salvar e sair
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-8 py-8">
        <div className="flex flex-col gap-8 w-150">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                {progressLabel}
              </span>
              <span className="text-sm font-semibold text-primary font-(family-name:--font-inter)]">
                {blockIndex + 1}/{totalBlocks}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-b from-cta to-accent transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {isMCEES && currentBlock && (
            <>
              <h1 className="text-xl font-semibold text-text-primary text-center font-(family-name:--font-poppins)]">
                {currentBlock.title}
              </h1>

              <p className="text-sm text-text-secondary text-center font-(family-name:--font-inter)]">
                {instrument === "mcees_1a4"
                  ? "Clique nas frases na ordem do que é mais parecido com você (primeiro) até o menos parecido"
                  : "Para cada afirmação, escolha um número de 1 a 4. Cada número só pode ser usado uma vez."}
              </p>

              <RankingBlock
                items={currentBlock.items.map((item) => ({
                  dimension: item.d,
                  text: item.t,
                }))}
                mode={instrument === "mcees_1a4" ? "sequential" : "matrix"}
                ranks={currentRanks}
                onRankChange={(ranks) => {
                  setBlockRanks((prev) => ({
                    ...prev,
                    [blockKey]: ranks,
                  }));
                }}
              />
            </>
          )}

          {!isMCEES && currentSection && (
            <>
              <h1 className="text-xl font-semibold text-text-primary text-center font-(family-name:--font-poppins)]">
                {currentSection.title}
              </h1>

              <p className="text-sm text-text-secondary text-center font-(family-name:--font-inter)]">
                Escolha a opção que mais combina com você
              </p>

              <div className="flex flex-col gap-6">
                {currentSection.pairs.map((pair, pairIdx) => {
                  const pairKey = `p${pair.n}`;
                  return (
                    <div key={pairKey}>
                      <span className="text-xs font-medium text-text-muted font-(family-name:--font-inter)] mb-2 block">
                        Par {pairIdx + 1} de {sectionPairCount}
                      </span>
                      <PairChoice
                        pair={pair}
                        selected={meesAnswers[pairKey] ?? null}
                        onSelect={(choice) => {
                          setMeesAnswers((prev) => ({
                            ...prev,
                            [pairKey]: choice,
                          }));
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            {!isFirst ? (
              <Button
                variant="outline"
                size="md"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Anterior
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!canAdvance}
              className="flex items-center gap-2"
            >
              {isLast ? "Ver Resultado" : "Próximo"}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

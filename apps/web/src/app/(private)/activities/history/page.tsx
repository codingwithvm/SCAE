"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Palette,
  Music,
  Brain,
  FlaskConical,
  BookOpen,
  ImageIcon,
  PenTool,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { type ProfileName } from "@/lib/quiz/profile";
import {
  MOCK_HISTORY,
  DIFFICULTY_BADGE_VARIANT,
  type ActivityStatus,
  type HistoryEntry,
} from "@/lib/activities/activities";

const ICON_MAP: Record<
  string,
  React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }>
> = {
  palette: Palette,
  music: Music,
  brain: Brain,
  "flask-conical": FlaskConical,
  image: ImageIcon,
  "book-open": BookOpen,
  "pen-tool": PenTool,
};

type FilterOption = "Todas" | ActivityStatus;

const FILTER_OPTIONS: FilterOption[] = ["Todas", "Concluída", "Em andamento"];

const COMPLETED_ENTRIES = MOCK_HISTORY.filter(
  (entry) => entry.status === "Concluída",
);
const AVERAGE_SCORE =
  COMPLETED_ENTRIES.length > 0
    ? Math.round(
        COMPLETED_ENTRIES.reduce((sum, entry) => sum + (entry.score ?? 0), 0) /
          COMPLETED_ENTRIES.length,
      )
    : 0;

export default function ActivityHistoryPage() {
  const router = useRouter();
  const initialized = useRef(false);
  const [userName, setUserName] = useState<string>("Aluno");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("Todas");

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const storedProfile = localStorage.getItem(
      "quiz_profile",
    ) as ProfileName | null;
    if (!storedProfile) {
      router.replace("/dashboard");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as { name?: string };
    const firstName = parsedUser.name?.split(" ")[0] ?? "Aluno";
    setUserName(firstName);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("quiz_profile");
    router.replace("/login");
  }

  const filteredEntries =
    activeFilter === "Todas"
      ? MOCK_HISTORY
      : MOCK_HISTORY.filter((entry) => entry.status === activeFilter);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" aria-label="Início — SCAE">
            <Image
              src="/logo.png"
              alt="SCAE"
              width={116}
              height={32}
              priority
            />
          </Link>
          <span className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Olá, {userName}!
          </span>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/activities"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Voltar
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-error hover:opacity-75 transition-opacity cursor-pointer"
          >
            <LogOut size={18} aria-hidden="true" />
            Sair
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex flex-1 flex-col gap-5 px-8 py-6">
        {/* Page title */}
        <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
          Histórico de atividades
        </h1>

        {/* Summary card */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border-light bg-background px-6 py-4.5">
          <p className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            {COMPLETED_ENTRIES.length} atividades concluídas
          </p>
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Pontuação média: {AVERAGE_SCORE} pontos
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-border-light bg-background px-5 py-4">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={[
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer font-(family-name:--font-inter)]",
                activeFilter === option
                  ? "bg-primary text-white font-semibold"
                  : "bg-surface text-text-secondary hover:bg-border-light",
              ].join(" ")}
            >
              {option}
            </button>
          ))}
        </div>

        {/* History list */}
        <div className="flex flex-col gap-3.5">
          {filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl border border-border-light bg-background py-12">
              <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                Nenhuma atividade encontrada.
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

interface HistoryItemProps {
  entry: HistoryEntry;
}

function HistoryItem({ entry }: HistoryItemProps) {
  const IconComponent = ICON_MAP[entry.iconName] ?? BookOpen;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-light bg-background p-4">
      {/* Thumb */}
      <div
        className="flex h-22 w-22 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: entry.thumbColor }}
      >
        <IconComponent
          size={24}
          style={{ color: entry.iconColor }}
          aria-hidden="true"
        />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-text-primary font-(family-name:--font-poppins)]">
          {entry.title}
        </p>
        <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
          {entry.date}
        </p>
        {entry.score !== undefined && (
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Pontuação: {entry.score} pontos
          </p>
        )}
        <Badge variant={DIFFICULTY_BADGE_VARIANT[entry.difficulty]}>
          {entry.difficulty}
        </Badge>
      </div>
    </div>
  );
}

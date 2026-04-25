"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Lightbulb,
  Palette,
  Music,
  Brain,
  FlaskConical,
  BookOpen,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { type ProfileName } from "@/lib/quiz/profile";
import { PROFILE_DATA } from "@/lib/quiz/profile-data";
import {
  MOCK_ACTIVITIES,
  DIFFICULTY_OPTIONS,
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  DIFFICULTY_BADGE_VARIANT,
  STATUS_BADGE_VARIANT,
  type ActivityDifficulty,
  type ActivityCategory,
  type ActivityStatus,
  type Activity,
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
};

const COMPLETED_COUNT = MOCK_ACTIVITIES.filter(
  (activity) => activity.status === "Concluída",
).length;
const TOTAL_COUNT = MOCK_ACTIVITIES.length;
const PROGRESS_PERCENT = Math.round((COMPLETED_COUNT / TOTAL_COUNT) * 100);

export default function ActivitiesPage() {
  const router = useRouter();
  const initialized = useRef(false);
  const [quizProfile, setQuizProfile] = useState<ProfileName | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<ActivityDifficulty | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ActivityCategory | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | null>(
    null,
  );

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

    setQuizProfile(storedProfile);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("quiz_profile");
    router.replace("/login");
  }

  if (!quizProfile) return null;

  const profileData = PROFILE_DATA[quizProfile];

  const filteredActivities = MOCK_ACTIVITIES.filter((activity) => {
    if (selectedDifficulty && activity.difficulty !== selectedDifficulty)
      return false;
    if (selectedCategory && activity.category !== selectedCategory)
      return false;
    if (selectedStatus && activity.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <h1 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Atividades
        </h1>

        <div className="flex items-center gap-5">
          <Link
            href="/dashboard"
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
        {/* Profile summary */}
        <div className="flex items-center gap-4 rounded-2xl border border-border-light bg-background px-6 py-4.5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: "#FEF3C7" }}
          >
            <Lightbulb size={24} className="text-warning" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
              Perfil:{" "}
              <span style={{ color: profileData.color }}>{quizProfile}</span>
            </p>
            <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
              Atividades selecionadas para você
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3.5 rounded-2xl border border-border-light bg-background px-6 py-4.5">
          <FilterRow
            label="Dificuldade:"
            options={DIFFICULTY_OPTIONS}
            selected={selectedDifficulty}
            onSelect={(value) =>
              setSelectedDifficulty(
                selectedDifficulty === value
                  ? null
                  : (value as ActivityDifficulty),
              )
            }
          />
          <FilterRow
            label="Categoria:"
            options={CATEGORY_OPTIONS}
            selected={selectedCategory}
            onSelect={(value) =>
              setSelectedCategory(
                selectedCategory === value ? null : (value as ActivityCategory),
              )
            }
          />
          <FilterRow
            label="Status:"
            options={STATUS_OPTIONS}
            selected={selectedStatus}
            onSelect={(value) =>
              setSelectedStatus(
                selectedStatus === value ? null : (value as ActivityStatus),
              )
            }
          />
        </div>

        {/* Progress card */}
        <div className="flex flex-col gap-2.5 rounded-2xl border border-border-light bg-background px-6 py-4.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
              {COMPLETED_COUNT} de {TOTAL_COUNT} atividades concluídas
            </p>
            <span className="text-sm font-semibold text-primary font-(family-name:--font-inter)]">
              {PROGRESS_PERCENT}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${PROGRESS_PERCENT}%` }}
            />
          </div>
        </div>

        {/* Activity grid */}
        <div className="flex flex-col gap-4">
          {filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-light bg-background py-12">
              <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
                Nenhuma atividade encontrada com esses filtros.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {filteredActivities.slice(0, 3).map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
              {filteredActivities.length > 3 && (
                <div className="grid grid-cols-3 gap-4">
                  {filteredActivities.slice(3, 6).map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer link */}
        <div className="flex justify-center py-2">
          <button className="text-sm font-semibold text-primary hover:opacity-75 transition-opacity font-(family-name:--font-inter)]">
            Ver histórico completo
          </button>
        </div>
      </main>
    </div>
  );
}

interface FilterRowProps {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}

function FilterRow({ label, options, selected, onSelect }: FilterRowProps) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)] shrink-0">
        {label}
      </span>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={[
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer font-(family-name:--font-inter)]",
            selected === option
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary hover:bg-border-light",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

interface ActivityCardProps {
  activity: Activity;
}

function ActivityCard({ activity }: ActivityCardProps) {
  const IconComponent = ICON_MAP[activity.iconName] ?? BookOpen;

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="flex flex-col rounded-2xl border border-border-light bg-background overflow-hidden hover:shadow-[0_4px_16px_rgba(30,79,174,0.12)] transition-shadow no-underline"
    >
      {/* Thumbnail */}
      <div
        className="flex h-24 items-center justify-center"
        style={{ backgroundColor: activity.thumbColor }}
      >
        <IconComponent
          size={28}
          style={{ color: activity.iconColor }}
          aria-hidden="true"
        />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-2 px-4 pb-4 pt-3">
        <p className="text-base font-semibold text-text-primary font-(family-name:--font-poppins)]">
          {activity.title}
        </p>
        <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
          Cat: {activity.category}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={DIFFICULTY_BADGE_VARIANT[activity.difficulty]}>
            {activity.difficulty}
          </Badge>
          <Badge variant={STATUS_BADGE_VARIANT[activity.status]}>
            {activity.status}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

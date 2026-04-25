"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { type ProfileName } from "@/lib/quiz/profile";
import {
  MOCK_ACTIVITIES,
  DIFFICULTY_BADGE_VARIANT,
  STATUS_BADGE_VARIANT,
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

export default function ActivitySessionPage() {
  const router = useRouter();
  const params = useParams();
  const initialized = useRef(false);
  const [activity, setActivity] = useState<Activity | null>(null);

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

    const activityId = Number(params.id);
    const found = MOCK_ACTIVITIES.find((a) => a.id === activityId) ?? null;

    if (!found) {
      router.replace("/activities");
      return;
    }

    setActivity(found);
  }, [router, params.id]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("quiz_profile");
    router.replace("/login");
  }

  if (!activity) return null;

  const IconComponent = ICON_MAP[activity.iconName] ?? BookOpen;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/activities" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

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
      <main className="flex flex-1 flex-col gap-6 px-8 py-6">
        {/* Detail card */}
        <div className="flex flex-col rounded-2xl border border-border-light bg-background overflow-hidden shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
          {/* Thumb */}
          <div
            className="flex h-55 items-center justify-center rounded-t-2xl"
            style={{ backgroundColor: activity.thumbColor }}
          >
            <IconComponent
              size={48}
              style={{ color: activity.iconColor }}
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 px-7 py-6">
            <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
              {activity.title}
            </h1>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant={DIFFICULTY_BADGE_VARIANT[activity.difficulty]}>
                {activity.difficulty}
              </Badge>
              <Badge variant="info">{activity.category}</Badge>
              <Badge variant={STATUS_BADGE_VARIANT[activity.status]}>
                {activity.status}
              </Badge>
            </div>

            <p className="text-base text-text-secondary leading-relaxed font-(family-name:--font-inter)]">
              Nesta atividade, você vai criar uma narrativa interativa
              utilizando elementos visuais e textuais. Desenvolva personagens,
              cenários e uma trama envolvente que reflita sua criatividade e
              estilo pessoal.
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="flex flex-col gap-3.5 rounded-2xl border border-border-light bg-background px-7 py-5">
          <p className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Informações
          </p>

          <InfoRow label="Dificuldade:" value={activity.difficulty} />
          <InfoRow label="Categoria:" value={activity.category} />
          <InfoRow label="Status:" value={activity.status} />
          <InfoRow
            label="Melhor pontuação:"
            value="—"
            valueMuted={activity.status === "Nova"}
          />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Button variant="primary" size="lg" className="w-65">
            Iniciar atividade
          </Button>
          <p className="text-sm text-text-secondary font-(family-name:--font-inter)]">
            Atividade disponível para iniciar agora.
          </p>
        </div>
      </main>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  valueMuted?: boolean;
}

function InfoRow({ label, value, valueMuted = false }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-text-secondary font-(family-name:--font-inter)]">
        {label}
      </span>
      <span
        className={[
          "text-sm font-semibold font-(family-name:--font-inter)]",
          valueMuted ? "text-text-muted" : "text-text-primary",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

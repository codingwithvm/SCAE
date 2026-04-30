"use client";

import Link from "next/link";
import {
  MapPin,
  FileText,
  Gamepad2,
  ScrollText,
  School,
  Users,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const METRIC_ROWS = [
  [
    { label: "Municípios", value: "5", icon: MapPin },
    { label: "Escolas", value: "38", icon: School },
    { label: "Turmas", value: "152", icon: Users },
  ],
  [
    { label: "Professores", value: "304", icon: UserCheck },
    { label: "Alunos", value: "6.128", icon: GraduationCap },
    { label: "Formulários", value: "4", icon: FileText },
  ],
];

const STATUS_ITEMS = [
  { label: "API: Online", ok: true },
  { label: "Banco de dados: Online", ok: true },
];

const LAST_ACTIONS = [
  "Admin realizou login em 12/04/2024 14:32",
  "Maria Silva criou turma 5ºA em 12/04/2024 14:30",
  "Ana Lima completou avaliação MCEES em 12/04/2024 14:28",
  "Carlos Mendes editou escola em 12/04/2024 14:15",
  "Sistema realizou backup em 12/04/2024 14:00",
];

const QUICK_BUTTONS = [
  {
    label: "Gerenciar municípios",
    icon: MapPin,
    href: "/admin/municipalities",
  },
  { label: "Gerenciar formulários", icon: FileText, href: "/admin/forms" },
  { label: "Gerenciar simuladores", icon: Gamepad2, href: "/admin/simulators" },
  { label: "Ver logs", icon: ScrollText, href: "/admin/logs" },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title */}
      <h1 className="text-2xl font-bold text-text-primary font-(family-name:--font-poppins)]">
        Painel administrativo
      </h1>

      {/* Metrics grid — 2 rows × 3 cols */}
      <div className="flex flex-col gap-4">
        {METRIC_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-3 gap-4">
            {row.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col gap-2 bg-background rounded-lg border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cta shrink-0">
                  <Icon
                    size={20}
                    className="text-primary-dark"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-3xl font-bold text-text-primary font-(family-name:--font-poppins)]">
                  {value}
                </span>
                <span className="text-sm text-text-secondary font-(family-name:--font-inter)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Two col: status + last actions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status do sistema */}
        <div className="flex flex-col gap-4 bg-background rounded-lg border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Status do sistema
          </h2>
          <div className="flex flex-col gap-3">
            {STATUS_ITEMS.map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={[
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    ok ? "bg-success" : "bg-error",
                  ].join(" ")}
                />
                <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <span className="text-xs text-text-secondary font-(family-name:--font-inter)]">
            Última sincronização: 12/04/2024 14:32
          </span>
        </div>

        {/* Últimas ações */}
        <div className="flex flex-col gap-3 bg-background rounded-lg border border-border-light shadow-[0_2px_8px_var(--shadow-color)] p-6">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Últimas ações
          </h2>
          <div className="flex flex-col gap-3">
            {LAST_ACTIONS.map((action) => (
              <span
                key={action}
                className="text-sm text-text-primary font-(family-name:--font-inter)]"
              >
                {action}
              </span>
            ))}
          </div>
          <Link
            href="/admin/logs"
            className="text-sm font-semibold text-primary hover:opacity-75 transition-opacity self-start"
          >
            Ver todos os logs →
          </Link>
        </div>
      </div>

      {/* Quick access */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
          Acesso rápido
        </h2>
        <div className="flex items-center gap-3">
          {QUICK_BUTTONS.map(({ label, icon: Icon, href }) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              asChild
            >
              <Link href={href}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

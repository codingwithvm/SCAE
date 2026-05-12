"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Printer, ShieldAlert, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TierInfo {
  key: string;
  label: string;
  color: string;
}

interface Axes {
  x: number;
  y: number;
  confX: number | null;
  confY: number | null;
}

interface ReportData {
  assessmentId: string;
  instrument: string;
  profile: string;
  tier: string;
  tierInfo: TierInfo;
  profileData: { titulo: string; cor: string };
  axisLabels: { x: string; y: string };
  isTeacherInstrument: boolean;
  completedAt: string | null;
  axes?: Axes;
  dimensions?: Record<string, number>;
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[10px] bg-[#F5F7FA] border-[1.5px] border-[#E2E8F0] p-3 text-center">
      <span className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-wide leading-tight">
        {label}
      </span>
      <span
        className="text-2xl font-black"
        style={{ color: color || "#2D2D2D" }}
      >
        {value}
      </span>
    </div>
  );
}

function confColor(val: number) {
  if (val >= 55) return "#059669";
  if (val >= 40) return "#0047AB";
  return "#D97706";
}

export default function ManagerReportPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [backUrl, setBackUrl] = useState("/dashboard");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const stored = localStorage.getItem("auth_user");
    if (stored) {
      const parsed = JSON.parse(stored) as { role?: string };
      if (parsed.role === "TEACHER") setBackUrl("/teacher/dashboard");
      else if (parsed.role === "SCHOOL_MANAGER") setBackUrl("/school/students");
    }

    fetch(`/api/v1/assessments/${assessmentId}/report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Erro ao carregar relatório");
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [assessmentId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E4FAE] border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F7FA] px-8">
        <p className="text-[#7A7A7A] text-center">
          {error || "Relatório não encontrado"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(backUrl)}
        >
          Voltar
        </Button>
      </div>
    );
  }

  const { tierInfo, axes, dimensions, profileData } = data;
  const isTeacherInst = data.isTeacherInstrument;
  const profileLabel = isTeacherInst
    ? "Perfil de Ensino"
    : "Perfil de Aprendizagem";

  const instrumentLabels: Record<string, string> = {
    MCEES_1A4: "MCEES 1º ao 4º ano",
    MCEES_5A9: "MCEES 5º ao 9º ano",
    MCEES_PROF: "MCEES Professor",
    MEES_PROF: "MEES Professor",
  };

  const confX = axes?.confX ?? 0;
  const confY = axes?.confY ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-white border-b border-[#EDF2F7] shrink-0 print:hidden">
        <Link href={backUrl} aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>
        <div className="flex items-center gap-5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm font-medium text-[#1E4FAE] hover:opacity-75 transition-opacity cursor-pointer"
          >
            <Printer size={18} />
            Imprimir
          </button>
          <Link
            href={backUrl}
            className="flex items-center gap-1.5 text-sm font-medium text-[#1E4FAE] hover:opacity-75 transition-opacity no-underline"
          >
            <ArrowLeft size={18} />
            Voltar
          </Link>
        </div>
      </header>

      <main className="flex flex-col gap-6 w-full max-w-200 mx-auto py-12 px-8">
        {/* Warning */}
        <div className="flex items-start gap-2 rounded-lg bg-[#FFFBEB] border-[1.5px] border-[#FCD34D] px-3.5 py-2.5">
          <ShieldAlert size={16} className="text-[#78350F] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#78350F] font-(family-name:--font-inter)]">
            Área exclusiva do Gestor Acadêmico. Estes dados internos{" "}
            <strong>não são exibidos</strong> ao respondente, ao aluno nem aos
            pais/responsáveis.
          </p>
        </div>

        {/* Profile summary */}
        <div
          className="flex items-center gap-3 rounded-[10px] px-3.5 py-3"
          style={{
            backgroundColor: profileData.cor + "0D",
            border: `1.5px solid ${profileData.cor}25`,
          }}
        >
          <div
            className="w-10.5 h-10.5 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-black"
            style={{ backgroundColor: profileData.cor }}
          >
            {(profileData.titulo || data.profile).slice(0, 3)}
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold text-[#7A7A7A] uppercase tracking-wide">
              {profileLabel}
            </div>
            <div className="text-base font-extrabold text-[#2D2D2D]">
              {profileData.titulo || data.profile}
            </div>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              backgroundColor: tierInfo.color + "15",
              color: tierInfo.color,
              border: `1.5px solid ${tierInfo.color}30`,
            }}
          >
            {tierInfo.label}
          </span>
        </div>

        {/* Stats grid */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#EDF2F7] bg-white p-6">
          <div className="flex items-center gap-2.5 pb-2 border-b-[1.5px] border-[#E2E8F0]">
            <div className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-[#F0FDF4]">
              <BarChart3 size={18} className="text-[#059669]" />
            </div>
            <h3 className="text-[15px] font-bold text-[#2D2D2D] font-(family-name:--font-poppins)]">
              Dados Internos da Avaliação
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <StatCard
              label="Consistência Processamento"
              value={`${Math.round(confX)}%`}
              color={confColor(confX)}
            />
            <StatCard
              label="Consistência Percepção"
              value={`${Math.round(confY)}%`}
              color={confColor(confY)}
            />
            <StatCard
              label="Eixo Processamento (X)"
              value={`${(axes?.x ?? 0 > 0) ? "+" : ""}${axes?.x ?? 0}`}
            />
            <StatCard
              label="Eixo Percepção (Y)"
              value={`${(axes?.y ?? 0 > 0) ? "+" : ""}${axes?.y ?? 0}`}
            />
          </div>

          <div className="text-xs text-[#7A7A7A] px-3 py-2 bg-[#F5F7FA] rounded-md">
            Quadrante:{" "}
            <strong>
              {axes
                ? `${axes.x >= 0 ? "Experimentação" : "Reflexão"} + ${axes.y >= 0 ? "Conceituação" : "Vivência"}`
                : "—"}
            </strong>
            {" · "}Instrumento:{" "}
            <code className="bg-[#F1F5F9] px-1 py-0.5 rounded text-[11px]">
              {data.instrument}
            </code>
          </div>

          {dimensions && Object.keys(dimensions).length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(dimensions).map(([key, val]) => (
                <div
                  key={key}
                  className="flex flex-col items-center rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] p-2 text-center"
                >
                  <span className="text-[11px] font-bold text-[#7A7A7A]">
                    {key}
                  </span>
                  <span className="text-lg font-extrabold text-[#2D2D2D]">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-[13px] text-[#7A7A7A] text-center py-4">
          Concluído em:{" "}
          {data.completedAt
            ? new Date(data.completedAt).toLocaleString("pt-BR")
            : "—"}
          {" · "}Instrumento:{" "}
          {instrumentLabels[data.instrument] || data.instrument}
        </div>
      </main>
    </div>
  );
}

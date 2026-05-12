"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Star,
  Target,
  Lightbulb,
  Users,
  Rocket,
  ArrowRight,
} from "lucide-react";

interface ProfileData {
  titulo: string;
  cor: string;
  desc: string;
  fortes: string[];
  desafios: string[];
  estrategias?: string[];
  responsaveis?: string[];
  para1a4?: string[];
  para5a9?: string[];
  desenvolvimento?: string[];
  gscae: string;
}

interface GScaeStage {
  name: string;
  level: "gs-strong" | "gs-mid" | "gs-weak";
  description: string;
  tip?: string;
}

interface CompatibilityEntry {
  profile: string;
  color: string;
  note: string;
}

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
  profileData: ProfileData | null;
  gscae: GScaeStage[] | null;
  ludic: { emoji: string | null; tag: string | null };
  axisLabels: { x: string; y: string };
  isTeacherInstrument: boolean;
  completedAt: string | null;
  compatibility?: CompatibilityEntry[] | null;
  axes?: Axes;
  dimensions?: Record<string, number> | null;
  respondentName?: string | null;
  respondentSchool?: string | null;
  respondentClass?: string | null;
}

interface ReportClientProps {
  data: ReportData;
}

const LEVEL_STYLES: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    stars: string;
    starsColor: string;
  }
> = {
  "gs-strong": {
    bg: "#F0FDF4",
    border: "#059669",
    text: "#059669",
    stars: "★★★",
    starsColor: "#059669",
  },
  "gs-mid": {
    bg: "#EFF6FF",
    border: "#93C5FD",
    text: "#2563EB",
    stars: "★★",
    starsColor: "#2563EB",
  },
  "gs-weak": {
    bg: "#FFF5F5",
    border: "#FCA5A5",
    text: "#DC2626",
    stars: "★",
    starsColor: "#EF4444",
  },
};

function ConsistencyBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  if (value === null) return null;
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[11px] font-normal"
        style={{ color: "rgba(255,255,255,0.67)" }}
      >
        {label}
      </span>
      <div
        className="h-2 w-full rounded-sm overflow-hidden"
        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
      >
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: `${clamped}%`,
            backgroundColor: "rgba(255,255,255,0.85)",
          }}
        />
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 w-full pb-2 border-b-[1.5px] border-[#E2E8F0]">
      {icon}
      <h3 className="text-[15px] font-bold text-[#2D2D2D] font-(family-name:--font-poppins)]">
        {title}
      </h3>
    </div>
  );
}

function SectionIcon({
  bg,
  children,
}: {
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-center w-8.5 h-8.5 rounded-lg shrink-0"
      style={{ backgroundColor: bg }}
    >
      {children}
    </div>
  );
}

function ListItem({
  text,
  borderColor,
}: {
  text: string;
  borderColor: string;
}) {
  return (
    <div
      className="rounded-lg px-3.5 py-2.5"
      style={{
        backgroundColor: "#F5F7FA",
        borderLeft: `3px solid ${borderColor}`,
      }}
    >
      <p className="text-sm text-[#2D2D2D] font-(family-name:--font-inter)] leading-[1.45]">
        {text}
      </p>
    </div>
  );
}

function MapaSVG({
  x,
  y,
  maxR,
  isMEES,
}: {
  x: number;
  y: number;
  maxR: number;
  isMEES: boolean;
}) {
  const cx = 150;
  const cy = 150;
  const ax = 110;
  const dotX = cx + Math.round((x / maxR) * ax);
  const dotY = cy - Math.round((y / maxR) * ax);
  const q1 = isMEES ? "Avaliador" : "Estrategista";
  const q2 = isMEES ? "Especialista" : "Analítico";
  const q3 = isMEES ? "Mentor" : "Criativo";
  const q4 = isMEES ? "Facilitador" : "Prático";

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-70">
      <rect
        x="150"
        y="40"
        width="108"
        height="108"
        rx="6"
        fill="#EFF6FF"
        opacity=".7"
      />
      <rect
        x="42"
        y="40"
        width="108"
        height="108"
        rx="6"
        fill="#F0FDF4"
        opacity=".7"
      />
      <rect
        x="42"
        y="152"
        width="108"
        height="108"
        rx="6"
        fill="#FFF7ED"
        opacity=".7"
      />
      <rect
        x="150"
        y="152"
        width="108"
        height="108"
        rx="6"
        fill="#F5F3FF"
        opacity=".7"
      />
      <line
        x1="42"
        y1="150"
        x2="258"
        y2="150"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      <line
        x1="150"
        y1="40"
        x2="150"
        y2="260"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      <polygon points="258,150 252,145 252,155" fill="#CBD5E1" />
      <polygon points="150,40 145,46 155,46" fill="#CBD5E1" />
      <text
        x="204"
        y="80"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#1D4ED8"
      >
        {q1}
      </text>
      <text
        x="96"
        y="80"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#166534"
      >
        {q2}
      </text>
      <text
        x="96"
        y="222"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#92400E"
      >
        {q3}
      </text>
      <text
        x="204"
        y="222"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#5B21B6"
      >
        {q4}
      </text>
      <text x="204" y="145" fontSize="9" fill="#64748B" textAnchor="middle">
        Experimentação
      </text>
      <text x="96" y="145" fontSize="9" fill="#64748B" textAnchor="middle">
        Reflexão
      </text>
      <text x="150" y="32" fontSize="9" fill="#64748B" textAnchor="middle">
        Conceituação
      </text>
      <text x="150" y="275" fontSize="9" fill="#64748B" textAnchor="middle">
        Vivência
      </text>
      <circle cx={dotX} cy={dotY} r="16" fill="#0047AB" opacity=".15" />
      <circle cx={dotX} cy={dotY} r="8" fill="#0047AB" />
      <circle cx={dotX} cy={dotY} r="4" fill="#fff" />
    </svg>
  );
}

export function ReportClient({ data }: ReportClientProps) {
  const router = useRouter();

  if (!data.profileData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F7FA] px-8">
        <Target size={48} className="text-[#ECC94B]" />
        <p className="text-[#7A7A7A] text-center">Relatório não encontrado</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-full bg-[#1E4FAE] text-white font-semibold text-sm cursor-pointer"
        >
          Voltar
        </button>
      </div>
    );
  }

  const {
    profileData,
    tierInfo,
    gscae,
    axes,
    isTeacherInstrument,
    compatibility,
  } = data;
  const profileLabel = isTeacherInstrument
    ? "PERFIL DE ENSINO"
    : "PERFIL DE APRENDIZAGEM";
  const confTier = tierInfo.label;
  const completedDate = data.completedAt
    ? new Date(data.completedAt).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div className="flex items-center justify-between w-full max-w-200 mx-auto pt-6 px-8 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <Printer size={16} aria-hidden="true" />
          Imprimir
        </button>
      </div>

      <main className="flex flex-col gap-6 w-full max-w-200 mx-auto py-8 px-8">
        <div
          className="flex flex-col gap-2.5 rounded-xl p-7 w-full"
          style={{
            background: `linear-gradient(135deg, ${profileData.cor} 0%, ${profileData.cor}CC 100%)`,
          }}
        >
          <div
            className="flex items-center rounded-md px-3 py-1 w-fit"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <span
              className="text-xs font-bold tracking-wide"
              style={{ color: "rgba(255,255,255,0.87)" }}
            >
              {profileLabel}
            </span>
          </div>
          <h1 className="text-[28px] font-extrabold text-white font-(family-name:--font-poppins)]">
            {profileData.titulo}
          </h1>
          <p className="text-[15px] font-normal text-white/93 font-(family-name:--font-inter)] leading-[1.55]">
            {profileData.desc}
          </p>

          {axes && (
            <div className="flex flex-col gap-2 w-full mt-1.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-normal tracking-wide"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  CONSISTÊNCIA DO PERFIL
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                  }}
                >
                  {confTier}
                </span>
              </div>
              <ConsistencyBar label="Processamento" value={axes.confX} />
              <ConsistencyBar label="Percepção" value={axes.confY} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] flex-wrap">
          <span className="text-[13px] font-bold text-[#2D2D2D] font-(family-name:--font-inter)]">
            {data.respondentName || "Respondente"}
          </span>
          {data.respondentSchool && (
            <>
              <span className="text-[13px] text-[#A0AEC0]">·</span>
              <span className="text-[13px] text-[#7A7A7A] font-(family-name:--font-inter)]">
                {data.respondentSchool}
              </span>
            </>
          )}
          {data.respondentClass && (
            <>
              <span className="text-[13px] text-[#A0AEC0]">·</span>
              <span className="text-[13px] text-[#7A7A7A] font-(family-name:--font-inter)]">
                {data.respondentClass}
              </span>
            </>
          )}
          {completedDate && (
            <>
              <span className="text-[13px] text-[#A0AEC0]">·</span>
              <span className="text-[13px] text-[#7A7A7A] font-(family-name:--font-inter)]">
                Avaliado em {completedDate}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-6 p-6 rounded-xl bg-white border border-[#EDF2F7] shadow-[0_2px_12px_rgba(30,79,174,0.08)]">
          {axes && (
            <div className="flex flex-col items-center gap-3 w-full">
              <SectionHeader
                icon={
                  <SectionIcon bg="#05966920">
                    <Rocket size={18} className="text-[#059669]" />
                  </SectionIcon>
                }
                title="Mapa de Perfil SCAE"
              />
              <MapaSVG
                x={axes.x}
                y={axes.y}
                maxR={isTeacherInstrument ? 16 : 12}
                isMEES={isTeacherInstrument}
              />
            </div>
          )}

          <div className="flex flex-col gap-3 w-full">
            <SectionHeader
              icon={
                <SectionIcon bg="#FEF3C720">
                  <Star size={18} className="text-[#D97706]" />
                </SectionIcon>
              }
              title="Pontos Fortes"
            />
            <div className="flex flex-col gap-2">
              {profileData.fortes.map((item, i) => (
                <ListItem key={i} text={item} borderColor={profileData.cor} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <SectionHeader
              icon={
                <SectionIcon bg="#FEE2E2">
                  <Target size={18} className="text-[#DC2626]" />
                </SectionIcon>
              }
              title="Pontos de Atenção"
            />
            <div className="flex flex-col gap-2">
              {profileData.desafios.map((item, i) => (
                <ListItem key={i} text={item} borderColor="#EF4444" />
              ))}
            </div>
          </div>

          {profileData.estrategias && profileData.estrategias.length > 0 && (
            <div className="flex flex-col gap-3 w-full">
              <SectionHeader
                icon={
                  <SectionIcon bg="#F0FDF4">
                    <Lightbulb size={18} className="text-[#059669]" />
                  </SectionIcon>
                }
                title="Estratégias de Aprendizagem"
              />
              <div className="flex flex-col gap-2">
                {profileData.estrategias.map((item, i) => (
                  <ListItem key={i} text={item} borderColor="#059669" />
                ))}
              </div>
            </div>
          )}

          {isTeacherInstrument &&
            profileData.para1a4 &&
            profileData.para1a4.length > 0 && (
              <div className="flex flex-col gap-3 w-full">
                <SectionHeader
                  icon={
                    <SectionIcon bg="#F0FDF4">
                      <Lightbulb size={18} className="text-[#059669]" />
                    </SectionIcon>
                  }
                  title="Estratégias para o 1º ao 4º ano"
                />
                <div className="flex flex-col gap-2">
                  {profileData.para1a4.map((item, i) => (
                    <ListItem key={i} text={item} borderColor="#059669" />
                  ))}
                </div>
              </div>
            )}

          {isTeacherInstrument &&
            profileData.para5a9 &&
            profileData.para5a9.length > 0 && (
              <div className="flex flex-col gap-3 w-full">
                <SectionHeader
                  icon={
                    <SectionIcon bg="#F0FDF4">
                      <Lightbulb size={18} className="text-[#059669]" />
                    </SectionIcon>
                  }
                  title="Estratégias para o 5º ao 9º ano"
                />
                <div className="flex flex-col gap-2">
                  {profileData.para5a9.map((item, i) => (
                    <ListItem key={i} text={item} borderColor="#059669" />
                  ))}
                </div>
              </div>
            )}

          {isTeacherInstrument &&
            profileData.desenvolvimento &&
            profileData.desenvolvimento.length > 0 && (
              <div className="flex flex-col gap-3 w-full">
                <SectionHeader
                  icon={
                    <SectionIcon bg="#F5F3FF">
                      <Star size={18} className="text-[#7C3AED]" />
                    </SectionIcon>
                  }
                  title="Desenvolvimento Profissional"
                />
                <div className="flex flex-col gap-2">
                  {profileData.desenvolvimento.map((item, i) => (
                    <ListItem key={i} text={item} borderColor="#7C3AED" />
                  ))}
                </div>
              </div>
            )}

          {!isTeacherInstrument &&
            profileData.responsaveis &&
            profileData.responsaveis.length > 0 && (
              <div className="flex flex-col gap-3 w-full">
                <SectionHeader
                  icon={
                    <SectionIcon bg="#FFF7ED">
                      <Users size={18} className="text-[#D97706]" />
                    </SectionIcon>
                  }
                  title="Orientações SCAE para Pais e Responsáveis"
                />
                <div className="flex flex-col gap-2">
                  {profileData.responsaveis.map((item, i) => (
                    <ListItem key={i} text={item} borderColor="#D97706" />
                  ))}
                </div>
              </div>
            )}

          {gscae && (
            <div className="flex flex-col gap-3 w-full">
              <SectionHeader
                icon={
                  <SectionIcon bg="#EFF6FF">
                    <Rocket size={18} className="text-[#2563EB]" />
                  </SectionIcon>
                }
                title={
                  isTeacherInstrument
                    ? "Seu Perfil no Ciclo G-SCAE"
                    : "Você no Ciclo G-SCAE"
                }
              />
              <p className="text-[13px] text-[#7A7A7A] font-(family-name:--font-inter)] leading-[1.45]">
                O G-SCAE organiza a aprendizagem em 4 estágios.
                {isTeacherInstrument
                  ? " Veja onde o seu estilo de ensino brilha naturalmente — e onde investir mais atenção pedagógica."
                  : " Entender onde você brilha — e onde precisa de mais suporte — ajuda a tirar o máximo de qualquer contexto de aprendizagem."}
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                {gscae.map((stage) => {
                  const style =
                    LEVEL_STYLES[stage.level] || LEVEL_STYLES["gs-mid"];
                  return (
                    <div
                      key={stage.name}
                      className="flex flex-col items-center gap-1.25 rounded-[10px] px-2.5 py-3.5 text-center"
                      style={{
                        backgroundColor: style.bg,
                        border: `1.5px solid ${style.border}`,
                      }}
                    >
                      <span
                        className="text-[11px] font-extrabold tracking-wide uppercase"
                        style={{ color: style.text }}
                      >
                        {stage.name}
                      </span>
                      <span
                        className="text-[18px]"
                        style={{ color: style.starsColor }}
                      >
                        {style.stars}
                      </span>
                      <span className="text-[11px] text-[#7A7A7A] font-(family-name:--font-inter)] leading-[1.45]">
                        {stage.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {compatibility && compatibility.length > 0 && (
            <div className="flex flex-col gap-3 w-full">
              <SectionHeader
                icon={
                  <SectionIcon bg="#F5F3FF">
                    <Users size={18} className="text-[#7C3AED]" />
                  </SectionIcon>
                }
                title="Como Adaptar ao Perfil do Aluno"
              />
              <p className="text-[13px] text-[#7A7A7A] font-(family-name:--font-inter)] leading-[1.45]">
                Entender como o seu estilo de ensino se relaciona com cada
                perfil de aprendizagem é o passo mais concreto rumo a uma
                prática pedagógica verdadeiramente eficaz.
              </p>
              <div className="flex flex-col gap-2.5">
                {compatibility.map((entry) => (
                  <div
                    key={entry.profile}
                    className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]"
                  >
                    <span
                      className="text-[11px] font-bold whitespace-nowrap px-2.5 py-0.75 rounded-full min-w-22 text-center shrink-0 tracking-wide"
                      style={{
                        backgroundColor: entry.color + "18",
                        color: entry.color,
                        border: `1.5px solid ${entry.color}35`,
                      }}
                    >
                      {entry.profile}
                    </span>
                    <span className="text-sm text-[#2D2D2D] font-(family-name:--font-inter)] leading-normal">
                      {entry.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!data.instrument.endsWith("_PROF") && profileData.gscae && (
          <div
            className="flex flex-col gap-2.5 rounded-xl p-5.5"
            style={{
              background: "linear-gradient(135deg, #0047AB 0%, #0369A1 100%)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <Rocket size={20} className="text-white" />
              <span className="text-base font-bold text-white font-(family-name:--font-poppins)]">
                Próximo Passo: Simulador G-SCAE
              </span>
            </div>
            <p className="text-sm font-normal text-white/92 font-(family-name:--font-inter)] leading-[1.55]">
              {profileData.gscae}
            </p>
            <div className="flex items-center gap-1.5">
              {["Percebe", "Entende", "Aplica", "Resolve"].map((stage, i) => (
                <span key={stage} className="contents">
                  <span
                    className="px-3 py-1.25 rounded-full text-[13px] font-semibold text-white"
                    style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                  >
                    {stage}
                  </span>
                  {i < 3 && <ArrowRight size={14} className="text-white/50" />}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E4FAE] text-white font-semibold text-base cursor-pointer hover:bg-[#123B87] transition-colors font-(family-name:--font-poppins)]"
          >
            <Printer size={18} />
            Imprimir Relatório
          </button>
        </div>
      </main>
    </div>
  );
}

#!/usr/bin/env node
/**
 * gen_simulador_v4.js — Gerador G-SCAE v4
 * © G-SCAE — Todos os direitos reservados.
 *
 * NOVIDADES v4:
 *  - 5 fases por nível (Metodologia G-SCAE de Aprendizagem Estruturada):
 *      Fase 1 — PERCEBE    Ativação e Motivação       (15 min)
 *      Fase 2 — INVESTIGA  Investigação Guiada        (20 min)
 *      Fase 3 — REGISTRA   Registro Reflexivo         (15 min, campo texto)
 *      Fase 4 — CONSOLIDA  Sistematização             (15 min)
 *      Fase 5 — DEMONSTRA  Verificação SCAE           (15 min, MCQ)
 *  - Indicador visual das 5 fases dentro de cada nível
 *  - Registro reflexivo do aluno salvo no payload final
 *  - Painel de acessibilidade (alto contraste, tamanho de fonte)
 *  - Tabela de evidências SCAE na tela de resultados
 *
 * USO:
 *   node gen_simulador_v4.js <config.json> [output.html]
 *
 * CAMPOS OBRIGATÓRIOS POR NÍVEL:
 *   stage, fase1_percebe, fase2_investiga,
 *   fase3_registra, fase4_consolida, questions_bank
 */
"use strict";

const fs = require("fs");
const path = require("path");

const MASTERY_THRESHOLD = 0.75;
const INITIAL_DRAW = 4;
const MAX_EXTRA_ROUNDS = 2;

// ── VALIDAÇÃO ─────────────────────────────────────────────────────────────────

function validateConfig(cfg) {
  const top = [
    "habilidadeCode",
    "habilidadeDesc",
    "discipline",
    "grade",
    "title",
    "level1",
    "level2",
    "level3",
  ];
  for (const k of top) {
    if (!cfg[k]) throw new Error(`Campo obrigatório ausente: "${k}"`);
  }
  for (let i = 1; i <= 4; i++) {
    const lvl = cfg[`level${i}`];
    if (!lvl) {
      if (i <= 3) throw new Error(`level${i} ausente`);
      continue;
    }
    for (const f of [
      "stage",
      "fase1_percebe",
      "fase2_investiga",
      "fase3_registra",
      "fase4_consolida",
    ]) {
      if (!lvl[f])
        throw new Error(
          `level${i}.${f} obrigatório (use gen_simulador_v3.js para configs no formato antigo)`,
        );
    }
    const bank = lvl.questions_bank;
    if (!Array.isArray(bank) || bank.length < 4)
      throw new Error(
        `level${i}.questions_bank precisa de ao menos 4 questões`,
      );
    for (const q of bank) {
      // Normaliza options: objeto {A,B,C,D} → array ["a","b","c","d"]
      if (
        q.options &&
        !Array.isArray(q.options) &&
        typeof q.options === "object"
      ) {
        q.options = ["A", "B", "C", "D"].map((k) => q.options[k] || "");
      }
      if (
        !q.id ||
        !q.text ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        !q.correct
      )
        throw new Error(`Questão inválida em level${i}: ${JSON.stringify(q)}`);
      if (!["A", "B", "C", "D"].includes(q.correct))
        throw new Error(`correct deve ser A|B|C|D — questão ${q.id}`);
    }
  }
}

function escH(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── CAEL SVG ──────────────────────────────────────────────────────────────────

function caelSVG(size) {
  const s = size / 120;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160"
    width="${size}" height="${Math.round(160 * s)}" aria-label="CAEL" role="img">
  <line x1="60" y1="18" x2="60" y2="6" stroke="#1E40AF" stroke-width="3" stroke-linecap="round"/>
  <circle cx="60" cy="4" r="4" fill="#3B82F6"/>
  <rect x="22" y="18" width="76" height="58" rx="18" fill="#DBEAFE" stroke="#1E40AF" stroke-width="2.5"/>
  <path d="M38 36 Q48 28 60 34 Q72 28 82 36 Q88 46 80 54 Q72 60 60 58 Q48 60 40 54 Q32 46 38 36Z" fill="#BFDBFE" stroke="#93C5FD" stroke-width="1.2"/>
  <ellipse cx="45" cy="52" rx="9" ry="9" fill="white" stroke="#1E40AF" stroke-width="1.5"/>
  <ellipse cx="75" cy="52" rx="9" ry="9" fill="white" stroke="#1E40AF" stroke-width="1.5"/>
  <circle cx="46" cy="52" r="5" fill="#1E40AF"/>
  <circle cx="76" cy="52" r="5" fill="#1E40AF"/>
  <circle cx="47" cy="51" r="2" fill="white"/>
  <circle cx="77" cy="51" r="2" fill="white"/>
  <path d="M46 68 Q60 78 74 68" stroke="#1E40AF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <rect x="28" y="78" width="64" height="52" rx="12" fill="#1E40AF" stroke="#1E3A8A" stroke-width="2"/>
  <rect x="38" y="86" width="44" height="28" rx="6" fill="#2563EB"/>
  <circle cx="50" cy="96" r="4" fill="#60A5FA" opacity="0.9"/>
  <circle cx="60" cy="96" r="4" fill="#34D399" opacity="0.9"/>
  <circle cx="70" cy="96" r="4" fill="#FBBF24" opacity="0.9"/>
  <rect x="42" y="106" width="36" height="4" rx="2" fill="#1E40AF"/>
  <rect x="6" y="84" width="20" height="10" rx="5" fill="#1E40AF" stroke="#1E3A8A" stroke-width="1.5"/>
  <rect x="94" y="84" width="20" height="10" rx="5" fill="#1E40AF" stroke="#1E3A8A" stroke-width="1.5"/>
  <rect x="36" y="132" width="18" height="20" rx="6" fill="#1E40AF" stroke="#1E3A8A" stroke-width="1.5"/>
  <rect x="66" y="132" width="18" height="20" rx="6" fill="#1E40AF" stroke="#1E3A8A" stroke-width="1.5"/>
  <ellipse cx="45" cy="152" rx="12" ry="6" fill="#1E3A8A"/>
  <ellipse cx="75" cy="152" rx="12" ry="6" fill="#1E3A8A"/>
</svg>`;
}

// ── HTML TEMPLATE ─────────────────────────────────────────────────────────────

function generateHTML(cfg) {
  const {
    habilidadeCode,
    habilidadeDesc,
    discipline,
    grade,
    title,
    level1,
    level2,
    level3,
    level4,
    studentAge,
    schoolName,
    scaeProfile,
  } = cfg;

  const showLGPD = studentAge === undefined || studentAge < 18;
  const l4 = level4 || null;
  const cael = caelSVG(96);
  const caelSm = caelSVG(60);

  const configJSON = JSON.stringify({
    habilidadeCode,
    habilidadeDesc,
    discipline,
    grade,
    title,
    scaeProfile: scaeProfile || null,
    initialDraw: INITIAL_DRAW,
    masteryThreshold: MASTERY_THRESHOLD,
    maxExtraRounds: MAX_EXTRA_ROUNDS,
    levels: [level1, level2, level3, ...(l4 ? [l4] : [])].map((lvl) => ({
      stage: lvl.stage,
      phases: [
        {
          label: "PERCEBE",
          duration: "15 min",
          content: lvl.fase1_percebe,
          isReflection: false,
          isApplication: false,
        },
        {
          label: "INVESTIGA",
          duration: "20 min",
          content: lvl.fase2_investiga,
          isReflection: false,
          isApplication: false,
        },
        {
          label: "REGISTRA",
          duration: "15 min",
          content: lvl.fase3_registra,
          isReflection: true,
          isApplication: false,
        },
        {
          label: "CONSOLIDA",
          duration: "15 min",
          content: lvl.fase4_consolida,
          isReflection: false,
          isApplication: false,
        },
        {
          label: "DEMONSTRA",
          duration: "15 min",
          content: null,
          isReflection: false,
          isApplication: true,
          questions_bank: lvl.questions_bank,
        },
      ],
    })),
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>G-SCAE v4 — ${escH(habilidadeCode)} — ${escH(title)}</title>
<style>
:root{--fs:1rem;--bg:#F0F9FF;--text:#1E293B;--card:#fff;--border:#E2E8F0;--muted:#64748B}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:var(--fs);min-height:100vh;line-height:1.5}

/* ACESSIBILIDADE */
body.hc{--bg:#000;--text:#fff;--card:#111;--border:#666;--muted:#aaa;filter:contrast(1.25)}
body.hc #sim-header{background:#000;border:2px solid #fff}
body.hc .opt{background:#111;border-color:#666;color:#fff}
body.hc .opt:hover:not(:disabled){background:#222;border-color:#fff}
body.hc #stage-content-inner{background:#1a1a1a;border-color:#444;color:#eee}

/* LGPD */
#lgpd-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:${showLGPD ? "flex" : "none"};align-items:center;justify-content:center;z-index:9999}
#lgpd-modal{background:#fff;border-radius:16px;padding:28px;max-width:460px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:slideUp .3s ease}
#lgpd-modal h2{color:#1E40AF;margin-bottom:10px;font-size:1.1rem}
#lgpd-modal p{color:#475569;font-size:.875rem;line-height:1.6;margin-bottom:10px}
#lgpd-modal ul{color:#475569;font-size:.82rem;padding-left:18px;margin-bottom:14px}
#lgpd-modal li{margin-bottom:4px}
.lgpd-check{display:flex;align-items:flex-start;gap:8px;margin-bottom:12px;cursor:pointer}
.lgpd-check input{margin-top:3px;accent-color:#1E40AF}
.lgpd-check label{font-size:.82rem;color:#334155;cursor:pointer}
#lgpd-btn{width:100%;padding:11px;background:#1E40AF;color:#fff;border:none;border-radius:8px;font-size:.95rem;font-weight:700;cursor:pointer;transition:background .2s}
#lgpd-btn:disabled{background:#94A3B8;cursor:not-allowed}
.lgpd-badge{display:inline-flex;align-items:center;gap:6px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:6px 10px;margin-bottom:16px;font-size:.78rem;color:#1E40AF}

/* LAYOUT */
#app{max-width:840px;margin:0 auto;padding:16px 14px 72px}

/* HEADER */
#sim-header{background:linear-gradient(135deg,#1E40AF 0%,#0EA5E9 100%);border-radius:14px;padding:18px 22px;color:#fff;margin-bottom:14px}
#sim-header h1{font-size:1rem;font-weight:700;margin-bottom:3px}
#sim-header p{font-size:.78rem;opacity:.85;line-height:1.4}
.hdr-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.hdr-badge{background:rgba(255,255,255,.2);border-radius:20px;padding:3px 10px;font-size:.72rem;font-weight:600}

/* NÍVEL PROGRESS */
#level-progress{background:var(--card);border-radius:12px;padding:14px 18px;margin-bottom:12px;box-shadow:0 1px 6px rgba(0,0,0,.06)}
.level-pills{display:flex;gap:6px;margin-bottom:8px}
.level-pill{flex:1;text-align:center;padding:5px 2px;border-radius:20px;font-size:.7rem;font-weight:700;transition:all .25s;border:2px solid var(--border);color:#94A3B8;background:#F8FAFC}
.level-pill.active{border-color:#3B82F6;color:#1E40AF;background:#EFF6FF}
.level-pill.done{border-color:#22C55E;color:#15803D;background:#F0FDF4}
.level-pill.attention{border-color:#F59E0B;color:#B45309;background:#FFFBEB}
.overall-bar{height:5px;background:var(--border);border-radius:3px;overflow:hidden}
.overall-fill{height:100%;background:linear-gradient(90deg,#3B82F6,#0EA5E9);border-radius:3px;transition:width .5s ease;width:0}

/* FASE INDICATOR */
#phase-indicator{background:var(--card);border-radius:12px;padding:14px 18px;margin-bottom:12px;box-shadow:0 1px 6px rgba(0,0,0,.06)}
.phase-track{display:flex;align-items:center;justify-content:space-between;position:relative}
.phase-track::before{content:'';position:absolute;top:14px;left:14px;right:14px;height:2px;background:var(--border);z-index:0}
.phase-step{display:flex;flex-direction:column;align-items:center;gap:5px;position:relative;z-index:1;flex:1}
.phase-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;border:2px solid var(--border);background:var(--card);color:#94A3B8;transition:all .3s}
.phase-dot.active{border-color:#3B82F6;background:#3B82F6;color:#fff;box-shadow:0 0 0 3px #BFDBFE}
.phase-dot.done{border-color:#22C55E;background:#22C55E;color:#fff}
.phase-label{font-size:.62rem;color:var(--muted);text-align:center;font-weight:500;line-height:1.2;max-width:60px}
.phase-label.active{color:#1E40AF;font-weight:700}
.phase-label.done{color:#15803D}
.phase-duration{font-size:.58rem;color:#94A3B8}

/* CAEL */
#cael-area{display:flex;gap:14px;align-items:flex-start;background:var(--card);border-radius:14px;padding:14px;margin-bottom:12px;box-shadow:0 1px 6px rgba(0,0,0,.06)}
#cael-speech{flex:1;background:#EFF6FF;border:1.5px solid #BFDBFE;border-radius:12px;padding:12px 14px;font-size:.875rem;color:#1E40AF;line-height:1.5;position:relative}
#cael-speech::before{content:'';position:absolute;left:-10px;top:14px;border:5px solid transparent;border-right-color:#BFDBFE}
#cael-speech::after{content:'';position:absolute;left:-8px;top:15px;border:4px solid transparent;border-right-color:#EFF6FF}

/* PHASE CARD */
#phase-card{background:var(--card);border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,.06);overflow:hidden;margin-bottom:14px}
#phase-hdr{padding:13px 18px;border-bottom:1.5px solid #F1F5F9;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.phase-hdr-badge{padding:3px 12px;border-radius:20px;font-size:.8rem;font-weight:700;letter-spacing:.04em}
#phase-hdr-title{font-weight:600;color:var(--text);font-size:.92rem;flex:1}
.duration-badge{background:#F1F5F9;color:var(--muted);border-radius:20px;padding:2px 10px;font-size:.72rem;font-weight:600}
#phase-body{padding:18px}
#stage-content-inner{background:#F8FAFC;border-left:3px solid #3B82F6;border-radius:0 8px 8px 0;padding:13px 15px;margin-bottom:16px;font-size:.875rem;line-height:1.7;color:#334155}

/* REFLECTION */
#reflection-wrap{display:none}
#reflection-wrap.show{display:block}
.reflection-prompt{background:#FFFBEB;border:1.5px solid #FCD34D;border-radius:10px;padding:12px 14px;margin-bottom:12px;font-size:.875rem;color:#78350F;line-height:1.6}
.reflection-prompt strong{display:block;margin-bottom:4px;font-weight:700}
#reflection-textarea{width:100%;min-height:100px;border:1.5px solid var(--border);border-radius:10px;padding:12px;font-size:.875rem;font-family:inherit;color:var(--text);background:var(--card);resize:vertical;transition:border-color .2s;line-height:1.6}
#reflection-textarea:focus{outline:none;border-color:#3B82F6;box-shadow:0 0 0 3px #DBEAFE}
.reflection-char-count{text-align:right;font-size:.72rem;color:var(--muted);margin-top:4px}
.reflection-saved-badge{display:none;align-items:center;gap:6px;background:#F0FDF4;border:1.5px solid #22C55E;border-radius:8px;padding:6px 12px;font-size:.8rem;color:#15803D;font-weight:600;margin-top:8px}
.reflection-saved-badge.show{display:flex}

/* MCQ */
#mcq-wrap{display:none}
#mcq-wrap.show{display:block}
.q-card{border:1.5px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px;transition:border-color .2s}
.q-card.answered{border-color:#CBD5E1;opacity:.88}
.q-num{font-size:.68rem;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.q-text{font-size:.9rem;color:var(--text);line-height:1.5;margin-bottom:12px;font-weight:500}
.options{display:grid;gap:7px}
.opt{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:8px;border:1.5px solid var(--border);background:var(--card);cursor:pointer;text-align:left;font-size:.85rem;color:#334155;transition:all .15s;width:100%}
.opt:hover:not(:disabled){border-color:#3B82F6;background:#EFF6FF}
.opt:disabled{cursor:not-allowed}
.opt-letter{width:24px;height:24px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.75rem;color:#475569;flex-shrink:0}
.opt.correct{border-color:#22C55E;background:#F0FDF4;color:#15803D}
.opt.correct .opt-letter{background:#22C55E;color:#fff}
.opt.wrong{border-color:#EF4444;background:#FEF2F2;color:#B91C1C}
.opt.wrong .opt-letter{background:#EF4444;color:#fff}
.q-feedback{margin-top:7px;padding:7px 10px;border-radius:6px;font-size:.8rem;font-weight:500;display:none;align-items:center;gap:6px}
.q-feedback.show{display:flex}
.q-feedback.correct{background:#F0FDF4;color:#15803D}
.q-feedback.wrong{background:#FEF2F2;color:#B91C1C}
#score-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid #F1F5F9;margin-top:14px;font-size:.82rem;color:var(--muted)}
#score-val{font-weight:700;color:#1E40AF}
#mastery-badge{display:none;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;margin-top:12px;font-size:.875rem;font-weight:600}
#mastery-badge.pass{display:flex;background:#F0FDF4;color:#15803D;border:1.5px solid #22C55E}
#mastery-badge.fail{display:flex;background:#FEF2F2;color:#B91C1C;border:1.5px solid #EF4444}
#mastery-badge.advance{display:flex;background:#FFFBEB;color:#92400E;border:1.5px solid #F59E0B}

/* RETRY BANNER */
#retry-banner{display:none;background:#FFFBEB;border:1.5px solid #F59E0B;border-radius:12px;padding:12px 16px;margin-bottom:14px;color:#92400E;font-size:.875rem;align-items:center;gap:10px}
#retry-banner.show{display:flex}

/* BOTÕES */
.btn-row{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.btn{padding:11px 20px;border-radius:9px;border:none;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px}
.btn-primary{background:#1E40AF;color:#fff}
.btn-primary:hover{background:#1E3A8A;transform:translateY(-1px)}
.btn-secondary{background:#F0FDF4;color:#15803D;border:1.5px solid #22C55E}
.btn-secondary:hover{background:#DCFCE7}
.btn-reflection{background:#FEFCE8;color:#854D0E;border:1.5px solid #FCD34D}
.btn-reflection:hover{background:#FEF9C3}
.btn[disabled]{opacity:.5;cursor:not-allowed;transform:none!important}

/* RESULTADOS */
#results-screen{display:none;background:var(--card);border-radius:14px;padding:28px;box-shadow:0 1px 6px rgba(0,0,0,.06);text-align:center}
#results-screen h2{font-size:1.3rem;color:var(--text);margin-bottom:6px}
#results-screen>p{color:var(--muted);margin-bottom:20px}
.habil-info{background:#F8FAFC;border-radius:10px;padding:14px;margin-bottom:20px;text-align:left;border:1px solid var(--border);font-size:.82rem;line-height:1.5}
.habil-info strong{color:#1E40AF;display:block;margin-bottom:3px}
#scae-result{display:inline-flex;flex-direction:column;align-items:center;border-radius:14px;padding:16px 36px;margin-bottom:20px;border:2.5px solid}
#scae-level-name{font-size:1.8rem;font-weight:800;letter-spacing:.05em}
#spaece-name{font-size:.85rem;font-weight:600;margin-top:3px;opacity:.8}
.scores-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:22px}
.score-cell{border-radius:10px;padding:12px;border:1.5px solid var(--border);text-align:center}
.sc-stage{font-size:.68rem;font-weight:700;color:var(--muted);margin-bottom:3px}
.sc-pct{font-size:1.3rem;font-weight:800}
.sc-detail{font-size:.7rem;color:#94A3B8;margin-top:2px}
.sc-attention{font-size:.68rem;font-weight:600;color:#B45309;margin-top:4px}

/* REFLEXÕES */
.reflections-section{text-align:left;margin-bottom:22px}
.reflections-section h3{font-size:.9rem;font-weight:700;color:var(--text);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)}
.reflection-item{background:#FFFBEB;border:1px solid #FCD34D;border-radius:8px;padding:10px 14px;margin-bottom:8px}
.reflection-item-stage{font-size:.7rem;font-weight:700;color:#92400E;text-transform:uppercase;margin-bottom:4px}
.reflection-item-text{font-size:.85rem;color:#78350F;line-height:1.5;font-style:italic}

/* EVIDÊNCIAS */
.evidence-section{text-align:left;margin-bottom:22px;overflow-x:auto}
.evidence-section h3{font-size:.9rem;font-weight:700;color:var(--text);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)}
.evidence-table{width:100%;border-collapse:collapse;font-size:.78rem}
.evidence-table th{background:#F1F5F9;padding:8px 10px;text-align:left;font-weight:700;color:var(--muted);border:1px solid var(--border)}
.evidence-table td{padding:8px 10px;border:1px solid var(--border);vertical-align:top;line-height:1.5}
.evidence-table tr.reached td{font-weight:600}

/* A11Y PANEL */
#a11y-fab{position:fixed;bottom:20px;right:20px;width:44px;height:44px;border-radius:50%;background:#1E40AF;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.25);z-index:1000;transition:background .2s}
#a11y-fab:hover{background:#1E3A8A}
#a11y-panel{position:fixed;bottom:72px;right:20px;background:var(--card);border:1.5px solid var(--border);border-radius:14px;padding:16px;width:200px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:1000;display:none;animation:slideUp .2s ease}
#a11y-panel.show{display:block}
#a11y-panel h4{font-size:.82rem;font-weight:700;color:var(--text);margin-bottom:12px}
.a11y-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.a11y-row label{font-size:.8rem;color:var(--muted)}
.a11y-switch{position:relative;width:38px;height:20px}
.a11y-switch input{opacity:0;width:0;height:0}
.a11y-slider{position:absolute;inset:0;background:#CBD5E1;border-radius:20px;cursor:pointer;transition:.3s}
.a11y-slider::before{content:'';position:absolute;width:16px;height:16px;left:2px;bottom:2px;background:#fff;border-radius:50%;transition:.3s}
.a11y-switch input:checked+.a11y-slider{background:#1E40AF}
.a11y-switch input:checked+.a11y-slider::before{transform:translateX(18px)}
.font-btns{display:flex;gap:4px}
.font-btn{padding:3px 9px;border:1.5px solid var(--border);border-radius:6px;font-size:.8rem;font-weight:700;background:var(--card);color:var(--text);cursor:pointer}
.font-btn:hover{background:#F1F5F9}

@keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
@media(max-width:560px){
  #cael-area{flex-direction:column;align-items:center}
  #cael-speech::before,#cael-speech::after{display:none}
  .phase-label{font-size:.58rem}
  .scores-grid{grid-template-columns:1fr 1fr}
}
</style>
</head>
<body>

<!-- LGPD -->
<div id="lgpd-overlay" role="dialog" aria-modal="true" aria-labelledby="lgpd-title">
  <div id="lgpd-modal">
    <div class="lgpd-badge">
      <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
      Lei 15.211/2025 (ECA Digital) &amp; LGPD
    </div>
    <h2 id="lgpd-title">Antes de começar</h2>
    <p>Para usar esta atividade, precisamos do seu consentimento para registrar dados de aprendizagem conforme a <strong>LGPD</strong> e a <strong>Lei nº 15.211/2025</strong>.</p>
    <p><strong>O que registramos:</strong></p>
    <ul>
      <li>Respostas às questões (para relatório pedagógico)</li>
      <li>Suas reflexões escritas (visíveis apenas ao professor)</li>
      <li>Pontuação e nível SCAE atingido</li>
    </ul>
    <div class="lgpd-check">
      <input type="checkbox" id="lgpd-c1" onchange="checkLGPD()"/>
      <label for="lgpd-c1">Autorizo o uso dos meus dados de aprendizagem pelo sistema SCAE para fins pedagógicos.</label>
    </div>
    <div class="lgpd-check">
      <input type="checkbox" id="lgpd-c2" onchange="checkLGPD()"/>
      <label for="lgpd-c2">Li e concordo com a Política de Privacidade do SCAE.</label>
    </div>
    <button id="lgpd-btn" class="btn" disabled onclick="acceptLGPD()">Concordo — Começar Atividade</button>
  </div>
</div>

<!-- APP -->
<div id="app">

  <div id="sim-header">
    <h1>${escH(title)}</h1>
    <p>${escH(habilidadeDesc)}</p>
    <div class="hdr-meta">
      <span class="hdr-badge">${escH(discipline)}</span>
      <span class="hdr-badge">${escH(grade)}º Ano</span>
      <span class="hdr-badge">${escH(habilidadeCode)}</span>
      ${schoolName ? `<span class="hdr-badge">${escH(schoolName)}</span>` : ""}
    </div>
  </div>

  <div id="level-progress">
    <div class="level-pills" id="level-pills"></div>
    <div class="overall-bar"><div class="overall-fill" id="overall-fill"></div></div>
  </div>

  <div id="phase-indicator">
    <div class="phase-track" id="phase-track"></div>
  </div>

  <div id="cael-area">
    <div>${cael}</div>
    <div id="cael-speech" role="status" aria-live="polite">Olá! Sou o CAEL. Vamos aprender juntos!</div>
  </div>

  <div id="retry-banner">
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style="flex-shrink:0"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
    <span id="retry-msg">Vamos reforçar os pontos com dificuldade!</span>
  </div>

  <div id="phase-card">
    <div id="phase-hdr">
      <span class="phase-hdr-badge" id="level-badge">...</span>
      <span id="phase-hdr-title">Carregando...</span>
      <span class="duration-badge" id="duration-badge">15 min</span>
    </div>
    <div id="phase-body">
      <div id="stage-content-inner"></div>

      <!-- Reflexão (fase 3) -->
      <div id="reflection-wrap">
        <div class="reflection-prompt">
          <strong>Hora de refletir:</strong>
          <span id="reflection-prompt-text">O que você observou nesta atividade?</span>
        </div>
        <textarea id="reflection-textarea"
          placeholder="Escreva aqui suas observações e pensamentos..."
          oninput="onReflectionInput()"
          rows="4"></textarea>
        <div class="reflection-char-count"><span id="char-count">0</span> caracteres</div>
        <div class="reflection-saved-badge" id="reflection-saved">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd"/></svg>
          Reflexão registrada
        </div>
      </div>

      <!-- MCQ (fase 5) -->
      <div id="mcq-wrap">
        <div id="questions-wrap"></div>
        <div id="score-row">
          <span>Acertos nesta etapa:</span>
          <span id="score-val">0 / 0</span>
        </div>
        <div id="mastery-badge"></div>
      </div>

      <div class="btn-row" id="btn-row">
        <button class="btn btn-secondary" id="retry-btn" style="display:none" onclick="triggerExtraRound()">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
          Praticar mais
        </button>
        <button class="btn btn-reflection" id="save-reflection-btn" style="display:none" onclick="saveReflection()">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
          Registrar Reflexão
        </button>
        <button class="btn btn-primary" id="next-btn" style="display:none" onclick="nextAction()">
          Próxima Fase
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </div>
  </div>

  <!-- RESULTADOS -->
  <div id="results-screen" role="main" aria-live="polite">
    <div style="margin-bottom:14px">${caelSm}</div>
    <h2>Atividade Concluída</h2>
    <p>Veja seu desempenho e reflexões abaixo</p>
    <div class="habil-info">
      <strong>${escH(habilidadeCode)}</strong>${escH(habilidadeDesc)}
    </div>
    <div id="scae-result">
      <div id="scae-level-name">...</div>
      <div id="spaece-name">...</div>
    </div>
    <div class="scores-grid" id="scores-grid"></div>
    <div class="reflections-section" id="reflections-section" style="display:none">
      <h3>Suas Reflexões</h3>
      <div id="reflections-list"></div>
    </div>
    <div class="evidence-section">
      <h3>Tabela de Evidências SCAE</h3>
      <div id="evidence-table-wrap"></div>
    </div>
    <button class="btn btn-primary" onclick="restart()" style="margin-top:6px">
      <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
      Tentar Novamente
    </button>
  </div>

</div>

<!-- ACESSIBILIDADE -->
<button id="a11y-fab" onclick="toggleA11yPanel()" aria-label="Acessibilidade">
  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
</button>
<div id="a11y-panel" role="dialog" aria-label="Painel de Acessibilidade">
  <h4>Acessibilidade</h4>
  <div class="a11y-row">
    <label>Alto contraste</label>
    <label class="a11y-switch">
      <input type="checkbox" id="hc-toggle" onchange="toggleHighContrast()"/>
      <span class="a11y-slider"></span>
    </label>
  </div>
  <div class="a11y-row">
    <label>Tamanho da fonte</label>
    <div class="font-btns">
      <button class="font-btn" onclick="changeFontSize(-1)">A-</button>
      <button class="font-btn" onclick="changeFontSize(0)">A</button>
      <button class="font-btn" onclick="changeFontSize(1)">A+</button>
    </div>
  </div>
</div>

<script>
(function(){
'use strict';

const C  = ${configJSON};
const MASTERY   = C.masteryThreshold;
const INIT_DRAW = C.initialDraw;
const MAX_EXTRA = C.maxExtraRounds;

const SM = {
  CONHECE:{spaece:'Muito Crítico',color:'#DC2626',bg:'#FEF2F2'},
  ENTENDE:{spaece:'Crítico',      color:'#D97706',bg:'#FFFBEB'},
  APLICA :{spaece:'Intermediário',color:'#2563EB',bg:'#EFF6FF'},
  RESOLVE:{spaece:'Adequado',     color:'#16A34A',bg:'#F0FDF4'},
};

const PHASE_SPEECHES = [
  ["PERCEBE: observe com atenção e ative o que você já sabe.", "Prepare-se para perceber algo novo!", "Leia com calma. Identifique as ideias principais."],
  ["INVESTIGA: coloque a mão na massa! A prática é o melhor caminho.", "Observe, experimente e registre o que acontece.", "Hora de investigar! Use os dados e chegue às suas conclusões."],
  ["REGISTRA: escreva o que você percebeu com suas próprias palavras.", "Não existe resposta errada aqui. Registre o que você realmente pensou.", "O registro é onde o aprendizado se consolida."],
  ["CONSOLIDA: veja como tudo se conecta ao conceito.", "Hora de sistematizar! Leia com atenção.", "Conecte o que você investigou ao conhecimento formal."],
  ["DEMONSTRA: mostre o que aprendeu! Responda com cuidado.", "Use tudo que você percebeu, investigou e registrou.", "Confiança! Você percorreu todas as fases para chegar aqui."],
];

const LEVEL_SPEECHES = {
  CONHECE:["Vamos começar do início. Observe com atenção.", "Neste nível, vamos identificar conceitos fundamentais."],
  ENTENDE:["Vamos aprofundar! Agora você vai entender como funciona.", "Chegou a hora de compreender as relações entre conceitos."],
  APLICA :["Hora de aplicar o conhecimento em situações reais!", "Você vai usar o que aprendeu para resolver problemas."],
  RESOLVE:["Você chegou ao nível máximo! Demonstre seu domínio.", "Este é o desafio final. Mostre tudo que você aprendeu."],
};

const SP = {
  correct:["Correto! Muito bem.", "Isso mesmo! Raciocínio certeiro.", "Excelente! Continue assim.", "Resposta certa!"],
  wrong  :["Não foi dessa vez. Veja o que pode melhorar.", "Quase lá. Revise o contexto.", "Cada erro é uma chance de aprender.", "Continue tentando!"],
  retry  :["Vamos reforçar os pontos com dificuldade.", "Mais questões para consolidar o aprendizado.", "Pratique mais antes de avançar."],
  mastery:["Parabéns! Você atingiu o nível para avançar.", "Excelente desempenho! Pronto para o próximo nível.", "Domínio demonstrado! Vamos em frente."],
  adv    :["Você avançou, mas este tópico merece revisão.", "Continue, mas lembre de revisar os pontos difíceis."],
  done   :["Atividade concluída! Veja seu resultado.", "Parabéns pela dedicação!", "Missão cumprida!"],
};

// ── ESTADO ────────────────────────────────────────────────────────────────────
let S = freshState();
function freshState() {
  return {
    lgpdOK      : ${showLGPD ? "false" : "true"},
    levelIdx    : 0,
    phaseIdx    : 0,
    startedAt   : null,
    reflections : {},   // stage → text
    responses   : [],
    levelData   : {},   // stage → {correct,total,extraRound,needsAttention,usedIds}
    answered    : {},
    currentDraw : [],
  };
}

// ── LGPD ──────────────────────────────────────────────────────────────────────
window.checkLGPD = () => {
  const ok = document.getElementById('lgpd-c1').checked &&
             document.getElementById('lgpd-c2').checked;
  document.getElementById('lgpd-btn').disabled = !ok;
};
window.acceptLGPD = () => {
  S.lgpdOK = true;
  document.getElementById('lgpd-overlay').style.display = 'none';
  init();
};

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  if (!S.lgpdOK) return;
  S.startedAt = Date.now();
  buildLevelPills();
  renderLevel(0, 0);
}

function buildLevelPills() {
  const wrap = document.getElementById('level-pills');
  wrap.innerHTML = C.levels.map((l, i) =>
    \`<div class="level-pill" id="lpill-\${i}">\${l.stage}</div>\`
  ).join('');
}

// ── RENDER LEVEL + PHASE ──────────────────────────────────────────────────────
function renderLevel(levelIdx, phaseIdx) {
  S.levelIdx = levelIdx;
  S.phaseIdx = phaseIdx;
  const lvl   = C.levels[levelIdx];
  const stage = lvl.stage;
  const meta  = SM[stage];

  if (!S.levelData[stage]) {
    S.levelData[stage] = { correct:0, total:0, extraRound:0, needsAttention:false, usedIds:new Set() };
  }

  // Level pills
  C.levels.forEach((l, i) => {
    const p  = document.getElementById(\`lpill-\${i}\`);
    const ld = S.levelData[l.stage];
    p.className = 'level-pill' +
      (i < levelIdx ? (ld && ld.needsAttention ? ' attention' : ' done') :
       i === levelIdx ? ' active' : '');
  });

  // Overall progress bar
  const pct = Math.round(((levelIdx * 5 + phaseIdx) / (C.levels.length * 5)) * 100);
  document.getElementById('overall-fill').style.width = pct + '%';

  // Level badge
  const badge = document.getElementById('level-badge');
  badge.textContent = stage;
  badge.style.cssText = \`background:\${meta.bg};color:\${meta.color};border:1.5px solid \${meta.color}\`;

  if (phaseIdx === 0) {
    setCael(LEVEL_SPEECHES[stage] || LEVEL_SPEECHES.CONHECE);
  }

  renderPhase(phaseIdx);
}

// ── RENDER PHASE ──────────────────────────────────────────────────────────────
function renderPhase(phaseIdx) {
  S.phaseIdx = phaseIdx;
  const lvl   = C.levels[S.levelIdx];
  const phase = lvl.phases[phaseIdx];
  const stage = lvl.stage;
  const meta  = SM[stage];

  // Phase indicator
  buildPhaseIndicator(phaseIdx);

  // Header
  document.getElementById('phase-hdr-title').textContent =
    \`Fase \${phaseIdx + 1}: \${phase.label}\`;
  document.getElementById('duration-badge').textContent = phase.duration;

  // Hide all phase panels
  document.getElementById('stage-content-inner').style.display = 'none';
  document.getElementById('reflection-wrap').classList.remove('show');
  document.getElementById('mcq-wrap').classList.remove('show');
  document.getElementById('retry-banner').classList.remove('show');
  hideMastery();

  // Buttons
  document.getElementById('save-reflection-btn').style.display = 'none';
  document.getElementById('retry-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';

  if (phase.isApplication) {
    // Fase 5: MCQ
    document.getElementById('mcq-wrap').classList.add('show');
    S.answered = {};
    const draw = selectQuestions(lvl, INIT_DRAW, null);
    S.currentDraw = draw;
    renderQuestions(draw, stage);
    updateScore(stage);
    setCael(PHASE_SPEECHES[4]);
  } else if (phase.isReflection) {
    // Fase 3: Reflexão
    document.getElementById('stage-content-inner').style.display = 'block';
    document.getElementById('stage-content-inner').innerHTML = phase.content;
    document.getElementById('reflection-wrap').classList.add('show');
    const ta = document.getElementById('reflection-textarea');
    ta.value = S.reflections[stage] || '';
    document.getElementById('char-count').textContent = ta.value.length;
    const saved = document.getElementById('reflection-saved');
    if (S.reflections[stage]) {
      saved.classList.add('show');
    } else {
      saved.classList.remove('show');
    }
    document.getElementById('save-reflection-btn').style.display = 'inline-flex';
    document.getElementById('next-btn').style.display = 'inline-flex';
    document.getElementById('next-btn').textContent = 'Próxima Fase';
    document.getElementById('next-btn').appendChild(arrowIcon());
    setCael(PHASE_SPEECHES[2]);
  } else {
    // Fase 1, 2, 4: Conteúdo
    document.getElementById('stage-content-inner').style.display = 'block';
    document.getElementById('stage-content-inner').innerHTML = phase.content;
    document.getElementById('next-btn').style.display = 'inline-flex';
    const isLast = phaseIdx === 4;
    const isLastLevel = S.levelIdx === C.levels.length - 1;
    document.getElementById('next-btn').textContent =
      isLast ? (isLastLevel ? 'Ver Resultado' : 'Próximo Nível') : 'Próxima Fase';
    document.getElementById('next-btn').appendChild(arrowIcon());
    setCael(PHASE_SPEECHES[phaseIdx]);
  }

  document.getElementById('phase-card').scrollIntoView({ behavior:'smooth', block:'start' });
}

function arrowIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 20 20');
  svg.setAttribute('fill','currentColor');
  svg.setAttribute('width','14');
  svg.setAttribute('height','14');
  svg.innerHTML = '<path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>';
  return svg;
}

// ── PHASE INDICATOR ───────────────────────────────────────────────────────────
function buildPhaseIndicator(activeIdx) {
  const labels = ['PERCEBE','INVESTIGA','REGISTRA','CONSOLIDA','DEMONSTRA'];
  const durations = ['15 min','20 min','15 min','15 min','15 min'];
  const track = document.getElementById('phase-track');
  track.innerHTML = labels.map((lbl, i) => {
    const cls = i < activeIdx ? 'done' : i === activeIdx ? 'active' : '';
    return \`<div class="phase-step">
      <div class="phase-dot \${cls}">\${i < activeIdx
        ? '<svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd"/></svg>'
        : i + 1
      }</div>
      <div class="phase-label \${cls}">\${lbl}</div>
      <div class="phase-duration">\${durations[i]}</div>
    </div>\`;
  }).join('');
}

// ── NEXT ACTION ───────────────────────────────────────────────────────────────
window.nextAction = function() {
  const nextPhase = S.phaseIdx + 1;
  if (nextPhase < 5) {
    renderPhase(nextPhase);
  } else {
    // Phase 5 done via nextStage(); nextAction used for phases 1-4
    nextStage();
  }
};

window.saveReflection = function() {
  const text = document.getElementById('reflection-textarea').value.trim();
  const stage = C.levels[S.levelIdx].stage;
  S.reflections[stage] = text;
  document.getElementById('reflection-saved').classList.add('show');
  setCael(["Reflexão registrada! Continue para a próxima fase."]);
};

window.onReflectionInput = function() {
  const text = document.getElementById('reflection-textarea').value;
  document.getElementById('char-count').textContent = text.length;
};

// ── QUESTÕES ──────────────────────────────────────────────────────────────────
function selectQuestions(lvl, n, conceptFilter) {
  const sd   = S.levelData[lvl.stage] || { usedIds: new Set() };
  const bank = lvl.phases[4].questions_bank;
  let pool   = bank.filter(q => !sd.usedIds.has(q.id));

  if (conceptFilter && conceptFilter.length > 0) {
    const tagged = pool.filter(q => conceptFilter.includes(q.concept_tag));
    if (tagged.length > 0) pool = tagged;
  }

  if (C.scaeProfile) {
    const pm = pool.filter(q => q.profiles && q.profiles.includes(C.scaeProfile));
    if (pm.length >= Math.min(n, 2)) pool = [...pm, ...pool.filter(q => !pm.includes(q))];
  }

  return pool.sort(() => Math.random() - .5).slice(0, Math.min(n, pool.length));
}

function renderQuestions(questions, stage, append = false) {
  const wrap = document.getElementById('questions-wrap');
  const startNum = append ? wrap.querySelectorAll('.q-card').length : 0;
  if (!append) wrap.innerHTML = '';

  questions.forEach((q, qi) => {
    const opts = ['A','B','C','D'].map((l, oi) => \`
      <button class="opt" onclick="answer('\${q.id}','\${l}','\${q.correct}','\${stage}')"
        id="opt-\${q.id}-\${l}">
        <span class="opt-letter">\${l}</span>
        <span>\${escH(q.options[oi] || '')}</span>
      </button>\`).join('');
    wrap.insertAdjacentHTML('beforeend', \`
      <div class="q-card" id="qcard-\${q.id}">
        <div class="q-num">Questão \${startNum + qi + 1}</div>
        <div class="q-text">\${escH(q.text)}</div>
        <div class="options">\${opts}</div>
        <div class="q-feedback" id="fb-\${q.id}"></div>
      </div>\`);
  });
}

window.answer = function(qid, sel, correct, stage) {
  if (S.answered[qid]) return;
  S.answered[qid] = true;

  const isOk = sel === correct;
  const sd   = S.levelData[stage];
  sd.total++;
  if (isOk) sd.correct++;
  sd.usedIds.add(qid);

  ['A','B','C','D'].forEach(l => {
    const btn = document.getElementById(\`opt-\${qid}-\${l}\`);
    if (!btn) return;
    btn.disabled = true;
    if (l === correct) btn.classList.add('correct');
    else if (l === sel) btn.classList.add('wrong');
  });

  const msgs = isOk ? SP.correct : SP.wrong;
  const msg  = msgs[Math.floor(Math.random() * msgs.length)];
  const fb   = document.getElementById(\`fb-\${qid}\`);
  const ckSVG = '<svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd"/></svg>';
  const xSVG  = '<svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>';
  fb.innerHTML = (isOk ? ckSVG : xSVG) + ' ' + escH(msg);
  fb.className = \`q-feedback show \${isOk ? 'correct' : 'wrong'}\`;
  setCael([msg]);
  updateScore(stage);
  document.getElementById(\`qcard-\${qid}\`).classList.add('answered');

  const lvl  = C.levels[S.levelIdx];
  const qObj = lvl.phases[4].questions_bank.find(q => q.id === qid) || {};
  S.responses.push({
    questionId: qid, stage, selected: sel, correct, isCorrect: isOk,
    concept_tag: qObj.concept_tag || null,
    spaece_descriptor: qObj.spaece_descriptor || null,
    answeredAt: Date.now(),
  });

  if (S.currentDraw.every(q => S.answered[q.id])) {
    setTimeout(() => evaluateStage(stage), 500);
  }
};

function evaluateStage(stage) {
  const sd    = S.levelData[stage];
  const score = sd.total > 0 ? sd.correct / sd.total : 0;
  const lvl   = C.levels[S.levelIdx];
  const bank  = lvl.phases[4].questions_bank;

  if (score >= MASTERY) {
    showMastery('pass', pick(SP.mastery));
    showNextBtn(S.levelIdx < C.levels.length - 1 ? 'Próximo Nível' : 'Ver Resultado');
  } else if (sd.extraRound < MAX_EXTRA && bank.length > sd.usedIds.size) {
    showMastery('fail', pick(SP.retry));
    document.getElementById('retry-btn').style.display = 'inline-flex';
    document.getElementById('retry-banner').classList.add('show');
    document.getElementById('retry-msg').textContent =
      \`Você precisa de \${Math.round(MASTERY * 100)}% para avançar. Vamos reforçar!\`;
    setCael(SP.retry);
  } else {
    sd.needsAttention = true;
    showMastery('advance', pick(SP.adv));
    showNextBtn(S.levelIdx < C.levels.length - 1 ? 'Avançar mesmo assim' : 'Ver Resultado');
  }
}

window.triggerExtraRound = function() {
  const stage = C.levels[S.levelIdx].stage;
  const sd    = S.levelData[stage];
  sd.extraRound++;
  S.answered = {};
  hideMastery();
  document.getElementById('retry-btn').style.display = 'none';
  document.getElementById('retry-banner').classList.remove('show');

  const failedConcepts = S.responses
    .filter(r => r.stage === stage && !r.isCorrect && r.concept_tag)
    .map(r => r.concept_tag);

  const draw = selectQuestions(C.levels[S.levelIdx], INIT_DRAW, failedConcepts.length > 0 ? failedConcepts : null);
  if (draw.length === 0) {
    S.levelData[stage].needsAttention = true;
    showMastery('advance', pick(SP.adv));
    showNextBtn(S.levelIdx < C.levels.length - 1 ? 'Avançar mesmo assim' : 'Ver Resultado');
    return;
  }
  S.currentDraw = draw;
  renderQuestions(draw, stage, false);
  updateScore(stage);
  setCael(SP.retry);
  document.getElementById('questions-wrap').scrollIntoView({ behavior:'smooth', block:'start' });
};

function nextStage() {
  const next = S.levelIdx + 1;
  if (next < C.levels.length) {
    renderLevel(next, 0);
  } else {
    showResults();
  }
}

function showNextBtn(label) {
  const b = document.getElementById('next-btn');
  b.textContent = label;
  b.appendChild(arrowIcon());
  b.style.display = 'inline-flex';
  b.onclick = nextStage;
}

// ── RESULTADOS ────────────────────────────────────────────────────────────────
function showResults() {
  ['phase-card','cael-area','level-progress','phase-indicator','retry-banner'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('results-screen').style.display = 'block';

  let finalStage = C.levels[0].stage;
  C.levels.forEach(l => {
    const ld = S.levelData[l.stage];
    if (ld && ld.total > 0 && (ld.correct / ld.total) >= MASTERY) finalStage = l.stage;
  });
  const fm = SM[finalStage];

  const res = document.getElementById('scae-result');
  res.style.borderColor = fm.color;
  res.style.background  = fm.bg;
  document.getElementById('scae-level-name').style.color = fm.color;
  document.getElementById('scae-level-name').textContent = finalStage;
  document.getElementById('spaece-name').style.color     = fm.color;
  document.getElementById('spaece-name').textContent     = 'Nível SPAECE: ' + fm.spaece;

  // Scores grid
  const grid = document.getElementById('scores-grid');
  grid.innerHTML = C.levels.map(l => {
    const ld  = S.levelData[l.stage] || { correct:0, total:0, needsAttention:false };
    const pct = ld.total > 0 ? Math.round((ld.correct / ld.total) * 100) : 0;
    const m   = SM[l.stage];
    const att = ld.needsAttention ? \`<div class="sc-attention">Requer revisão</div>\` : '';
    return \`<div class="score-cell" style="border-color:\${m.color};background:\${m.bg}">
      <div class="sc-stage" style="color:\${m.color}">\${l.stage}</div>
      <div class="sc-pct" style="color:\${m.color}">\${pct}%</div>
      <div class="sc-detail">\${ld.correct}/\${ld.total} corretas</div>
      \${att}
    </div>\`;
  }).join('');

  // Reflexões
  const hasReflections = Object.keys(S.reflections).some(k => S.reflections[k]);
  if (hasReflections) {
    document.getElementById('reflections-section').style.display = 'block';
    const list = document.getElementById('reflections-list');
    list.innerHTML = C.levels.map(l => {
      const txt = S.reflections[l.stage];
      if (!txt) return '';
      const m = SM[l.stage];
      return \`<div class="reflection-item">
        <div class="reflection-item-stage" style="color:\${m.color}">\${l.stage}</div>
        <div class="reflection-item-text">"\${escH(txt)}"</div>
      </div>\`;
    }).join('');
  }

  // Tabela de evidências
  const evidenceDescs = {
    CONHECE: 'Identifica e nomeia conceitos básicos; reconhece vocabulário fundamental da habilidade',
    ENTENDE: 'Compreende relações entre conceitos; explica com suas palavras o que aprendeu',
    APLICA : 'Usa o conhecimento em situações novas; resolve problemas com o conceito aprendido',
    RESOLVE: 'Integra e transfere o conhecimento; resolve situações complexas e inéditas com autonomia',
  };
  const coleta = {
    CONHECE: 'Respostas MCQ + campo de reflexão escrita',
    ENTENDE: 'Respostas MCQ + análise de justificativas',
    APLICA : 'Resolução de problemas contextualizados',
    RESOLVE: 'Produção autônoma + transferência de aprendizado',
  };
  const feedback = {
    CONHECE: 'Retomada dos conceitos com exemplos concretos',
    ENTENDE: 'Discussão em grupo + mapas conceituais',
    APLICA : 'Projetos práticos + situações-problema reais',
    RESOLVE: 'Avaliação por portfólio + produção de síntese',
  };

  const reachedOrder = ['CONHECE','ENTENDE','APLICA','RESOLVE'].indexOf(finalStage);
  const tBody = C.levels.map(l => {
    const m    = SM[l.stage];
    const ld   = S.levelData[l.stage] || { correct:0, total:0 };
    const pct  = ld.total > 0 ? Math.round((ld.correct / ld.total) * 100) : '-';
    const ord  = ['CONHECE','ENTENDE','APLICA','RESOLVE'].indexOf(l.stage);
    const cls  = ord <= reachedOrder ? 'reached' : '';
    return \`<tr class="\${cls}" style="background:\${ord<=reachedOrder?m.bg:''}">
      <td style="color:\${m.color};font-weight:700">\${l.stage}<br><small style="color:\${m.color};opacity:.8">\${m.spaece}</small></td>
      <td>\${evidenceDescs[l.stage]}</td>
      <td>\${coleta[l.stage]}</td>
      <td>\${feedback[l.stage]}</td>
      <td style="text-align:center;font-weight:700;color:\${m.color}">\${pct}\${pct!=='-'?'%':''}</td>
    </tr>\`;
  }).join('');

  document.getElementById('evidence-table-wrap').innerHTML = \`
    <table class="evidence-table">
      <thead><tr>
        <th>Nível</th>
        <th>Evidências de Aprendizagem</th>
        <th>Como Coletar</th>
        <th>Feedback do Professor</th>
        <th>Resultado</th>
      </tr></thead>
      <tbody>\${tBody}</tbody>
    </table>\`;

  // Payload
  const scores = {};
  C.levels.forEach(l => {
    const ld = S.levelData[l.stage] || { correct:0, total:0 };
    scores[l.stage] = ld.total > 0 ? Math.round((ld.correct / ld.total) * 100) : 0;
  });

  const payload = {
    habilidadeCode : C.habilidadeCode,
    discipline     : C.discipline,
    grade          : C.grade,
    scaeLevel      : finalStage,
    spaeceLevel    : fm.spaece,
    scores,
    reflections    : S.reflections,
    responses      : S.responses,
    attentionStages: C.levels.filter(l => S.levelData[l.stage] && S.levelData[l.stage].needsAttention).map(l => l.stage),
    timeSpentSecs  : Math.round((Date.now() - S.startedAt) / 1000),
    completedAt    : new Date().toISOString(),
  };

  try { window.parent.postMessage({ type:'SCAE_COMPLETE', payload }, '*'); } catch(e) {}
  if (typeof window.onSCAEComplete === 'function') window.onSCAEComplete(payload);

  document.getElementById('overall-fill').style.width = '100%';
  setCael(SP.done);
}

// ── RESTART ───────────────────────────────────────────────────────────────────
window.restart = function() {
  S = freshState();
  S.lgpdOK    = true;
  S.startedAt = Date.now();
  ['phase-card','cael-area','level-progress','phase-indicator'].forEach(id => {
    document.getElementById(id).style.display = '';
  });
  document.getElementById('results-screen').style.display = 'none';
  buildLevelPills();
  renderLevel(0, 0);
};

// ── ACESSIBILIDADE ────────────────────────────────────────────────────────────
const FONT_SIZES = ['0.85rem','1rem','1.15rem'];
let fontIdx = 1;

window.toggleA11yPanel = function() {
  document.getElementById('a11y-panel').classList.toggle('show');
};
window.toggleHighContrast = function() {
  document.body.classList.toggle('hc');
};
window.changeFontSize = function(delta) {
  if (delta === 0) { fontIdx = 1; }
  else { fontIdx = Math.max(0, Math.min(2, fontIdx + delta)); }
  document.documentElement.style.setProperty('--fs', FONT_SIZES[fontIdx]);
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function setCael(msgs) {
  const t = Array.isArray(msgs) ? msgs[Math.floor(Math.random() * msgs.length)] : msgs;
  document.getElementById('cael-speech').textContent = t;
}
function updateScore(stage) {
  const ld = S.levelData[stage] || { correct:0, total:0 };
  document.getElementById('score-val').textContent = \`\${ld.correct} / \${ld.total}\`;
}
function showMastery(type, msg) {
  const el = document.getElementById('mastery-badge');
  const ico = {
    pass  :'<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd"/></svg>',
    fail  :'<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>',
    advance:'<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
  };
  el.innerHTML = (ico[type] || '') + ' ' + escH(msg);
  el.className = \`mastery-badge \${type}\`;
}
function hideMastery() {
  document.getElementById('mastery-badge').className = 'mastery-badge';
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function escH(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
if (S.lgpdOK) init();

})();
</script>
</body>
</html>`;
}

// ── CLI ───────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === "--help") {
    console.log("Uso: node gen_simulador_v4.js <config_v4.json> [output.html]");
    process.exit(0);
  }
  const configPath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : null;
  if (!fs.existsSync(configPath)) {
    console.error("Arquivo não encontrado: " + configPath);
    process.exit(1);
  }
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    console.error("JSON inválido: " + e.message);
    process.exit(1);
  }
  try {
    validateConfig(cfg);
  } catch (e) {
    console.error("Config inválida: " + e.message);
    process.exit(1);
  }
  const html = generateHTML(cfg);
  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, html, "utf-8");
    console.log(
      "Gerado v4: " +
        outputPath +
        " (" +
        (html.length / 1024).toFixed(1) +
        " KB)",
    );
  } else {
    process.stdout.write(html);
  }
}

if (require.main === module) main();
module.exports = { generateHTML, validateConfig };

"use client";

import { Construction } from "lucide-react";

export default function ActivitiesPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Construction size={48} className="text-text-muted" />
      <h1 className="text-xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
        Atividades
      </h1>
      <p className="text-sm text-text-secondary font-(family-name:--font-inter)] text-center max-w-md">
        O módulo de atividades está em desenvolvimento e será disponibilizado em
        breve.
      </p>
    </div>
  );
}

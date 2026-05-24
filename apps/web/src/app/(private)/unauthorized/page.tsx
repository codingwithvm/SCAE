"use client";

import { useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border-light bg-background px-12 py-10 shadow-[0_2px_8px_rgba(30,79,174,0.08)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
          <ShieldX size={32} className="text-error" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-semibold text-text-primary font-(family-name:--font-poppins)]">
            Acesso negado
          </h1>
          <p className="text-base text-text-secondary font-(family-name:--font-inter)]">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    </div>
  );
}

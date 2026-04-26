"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MunicipalSidebar } from "@/components/layout/MunicipalSidebar";

interface AuthenticatedUser {
  id: string;
  name: string | null;
  role: string;
}

export default function MunicipalLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const initialized = useRef(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = localStorage.getItem("auth_user");
    if (!stored) {
      router.replace("/login");
      return;
    }

    const parsed = JSON.parse(stored) as AuthenticatedUser;
    if (parsed.role !== "MUNICIPAL_MANAGER") {
      router.replace("/login");
      return;
    }

    setUser(parsed);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.replace("/login");
  }

  if (!user) return null;

  const userName = user.name ?? "Gestor";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/municipal/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shrink-0">
            <span className="text-sm font-semibold text-white font-(family-name:--font-poppins)]">
              {initial}
            </span>
          </div>
          <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
            {userName}
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <MunicipalSidebar onLogout={handleLogout} />
        <main className="flex flex-1 flex-col overflow-y-auto px-10 py-8 gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}

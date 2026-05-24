"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { MunicipalSidebar } from "@/components/layout/MunicipalSidebar";
import { NotificationsBell } from "@/components/gscae/NotificationsBell";

interface AuthenticatedUser {
  id: string;
  name: string | null;
  email?: string | null;
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/municipal/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <div className="flex items-center gap-4">
          <NotificationsBell />
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shrink-0 cursor-pointer transition-opacity hover:opacity-85"
              aria-label="Menu do usuário"
            >
              <span className="text-sm font-semibold text-white font-(family-name:--font-poppins)]">
                {initial}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border-light bg-background shadow-lg z-50">
                <div className="px-4 py-3 border-b border-border-light">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {userName}
                  </p>
                  {user.email && (
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {user.email}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-surface transition-colors cursor-pointer rounded-b-lg"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <MunicipalSidebar onLogout={handleLogout} />
        <main className="flex flex-1 flex-col overflow-y-auto px-10 py-8 gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}

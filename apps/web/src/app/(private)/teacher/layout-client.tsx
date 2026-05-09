"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";

interface AuthenticatedUser {
  id: string;
  name: string | null;
  email?: string | null;
  role: string;
}

interface TeacherLayoutClientProps {
  children: React.ReactNode;
}

export default function TeacherLayoutClient({
  children,
}: TeacherLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const initialized = useRef(false);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as AuthenticatedUser;
    if (parsedUser.role !== "TEACHER") {
      router.replace("/login");
      return;
    }

    setUser(parsedUser);
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
    localStorage.removeItem("teacher_profile");
    router.replace("/login");
  }

  if (!user) return null;

  const userName = user.name ?? "Professor";
  const initial = userName.charAt(0).toUpperCase();

  if (pathname.startsWith("/teacher/quiz")) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/teacher/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

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
      </header>

      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar userName={userName} />
        <main className="flex flex-1 flex-col overflow-y-auto px-10 py-8 gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}

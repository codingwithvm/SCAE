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

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as AuthenticatedUser;
    if (parsedUser.role === "STUDENT") {
      router.replace("/dashboard");
      return;
    }

    setUser(parsedUser);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("teacher_profile");
    router.replace("/login");
  }

  if (!user) return null;

  const userName = user.name ?? "Professor";
  const initial = userName.charAt(0).toUpperCase();

  // Quiz pages are full-screen — no chrome
  if (pathname.startsWith("/teacher/quiz")) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
        <Link href="/teacher/dashboard" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shrink-0">
            <span className="text-sm font-semibold text-white font-(family-name:--font-poppins)]">
              {initial}
            </span>
          </div>

          {/* Name */}
          <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
            {userName}
          </span>

          {/* Logout — replaces chevron, error color */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className="flex items-center justify-center text-error hover:opacity-75 transition-opacity cursor-pointer"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar userName={userName} />
        <main className="flex flex-1 flex-col overflow-y-auto px-10 py-8 gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}

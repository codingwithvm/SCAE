"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  BarChart3,
  LogOut,
} from "lucide-react";

interface SchoolSidebarProps {
  onLogout: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/school/dashboard", icon: LayoutDashboard },
  { label: "Turmas", href: "/school/classes", icon: Users },
  { label: "Professores", href: "/school/teachers", icon: UserCheck },
  { label: "Alunos", href: "/school/students", icon: GraduationCap },
  { label: "Relatórios", href: "/school/reports", icon: BarChart3 },
];

export function SchoolSidebar({ onLogout }: SchoolSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="flex flex-col justify-between w-65 shrink-0 bg-background border-r border-border-light min-h-full">
      <nav className="flex flex-col gap-1 px-4 pt-6">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors no-underline",
                active
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface",
              ].join(" ")}
            >
              <Icon
                size={18}
                className={active ? "text-white" : "text-text-secondary"}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface transition-colors cursor-pointer w-full text-left mt-1"
        >
          <LogOut
            size={18}
            className="text-text-secondary"
            aria-hidden="true"
          />
          Sair
        </button>
      </nav>
    </aside>
  );
}

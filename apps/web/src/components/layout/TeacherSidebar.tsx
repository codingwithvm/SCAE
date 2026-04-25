"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, User, LogOut } from "lucide-react";

interface TeacherSidebarProps {
  userName: string;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  {
    label: "Minha avaliação",
    href: "/teacher/assessment",
    icon: ClipboardList,
  },
  { label: "Meu perfil", href: "/teacher/profile", icon: User },
];

export function TeacherSidebar({ userName, onLogout }: TeacherSidebarProps) {
  const pathname = usePathname();
  const initial = userName.charAt(0).toUpperCase();

  return (
    <aside className="flex flex-col justify-between w-65 shrink-0 bg-background border-r border-border-light h-full">
      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-4 py-6">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors no-underline",
                isActive
                  ? "bg-primary text-white font-medium"
                  : "text-text-secondary hover:bg-surface",
              ].join(" ")}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="flex flex-col gap-1 px-4 py-4 border-t border-border-light">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shrink-0">
            <span className="text-xs font-semibold text-white font-(family-name:--font-poppins)]">
              {initial}
            </span>
          </div>
          <span className="text-sm font-medium text-text-primary font-(family-name:--font-inter)] truncate">
            {userName}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-error hover:bg-surface transition-colors cursor-pointer w-full"
        >
          <LogOut size={18} aria-hidden="true" />
          Sair
        </button>
      </div>
    </aside>
  );
}

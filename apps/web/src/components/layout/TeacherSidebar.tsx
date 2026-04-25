"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, User } from "lucide-react";

interface TeacherSidebarProps {
  userName: string;
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

export function TeacherSidebar({ userName: _userName }: TeacherSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/teacher/assessment") {
      return pathname === href || pathname.startsWith("/teacher/quiz");
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="flex flex-col w-65 shrink-0 bg-background border-r border-border-light min-h-full">
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
      </nav>
    </aside>
  );
}

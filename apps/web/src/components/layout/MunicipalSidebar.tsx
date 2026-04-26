"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, School, BarChart3, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/municipal/dashboard", icon: LayoutDashboard },
  { label: "Escolas", href: "/municipal/schools", icon: School },
  { label: "Relatórios", href: "/municipal/reports", icon: BarChart3 },
];

interface MunicipalSidebarProps {
  onLogout: () => void;
}

export function MunicipalSidebar({ onLogout }: MunicipalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-55 shrink-0 bg-background border-r border-border-light min-h-full">
      <nav className="flex flex-col gap-1 px-4 pt-6">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary",
              ].join(" ")}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
        >
          <LogOut size={18} aria-hidden="true" />
          Sair
        </button>
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Gamepad2,
  ScrollText,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Municípios", href: "/admin/municipalities", icon: MapPin },
  { label: "Formulários", href: "/admin/forms", icon: FileText },
  { label: "Simuladores", href: "/admin/simulators", icon: Gamepad2 },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-65 shrink-0 bg-background border-r border-border-light min-h-full">
      <nav className="flex flex-col gap-1 px-4 pt-6">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors",
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
      </nav>
    </aside>
  );
}

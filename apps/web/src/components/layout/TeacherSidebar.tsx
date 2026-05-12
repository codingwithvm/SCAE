"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Users,
  PieChart,
  ChevronDown,
} from "lucide-react";

interface TeacherSidebarProps {
  userName: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  children?: { label: string; href: string; icon: typeof Users }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  {
    label: "Meus alunos",
    href: "/teacher/students",
    icon: GraduationCap,
    children: [
      { label: "Alunos", href: "/teacher/students", icon: Users },
      { label: "Perfis", href: "/teacher/profiles", icon: PieChart },
    ],
  },
  { label: "Meu perfil", href: "/teacher/profile", icon: User },
];

const CLASS_PROFILES_REGEX = /^\/teacher\/classes\/[^/]+\/profiles/;

export function TeacherSidebar({ userName: _userName }: TeacherSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOnClassProfiles = CLASS_PROFILES_REGEX.test(pathname);
  const classBadge = isOnClassProfiles
    ? searchParams.get("turma") || null
    : null;

  function isActive(href: string) {
    if (href === "/teacher/profiles" && isOnClassProfiles) return true;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isGroupActive(item: NavItem) {
    if (isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    if (pathname.startsWith("/teacher/classes/")) return true;
    return false;
  }

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      NAV_ITEMS.forEach((item) => {
        if (item.children && isGroupActive(item)) {
          initial[item.label] = true;
        }
      });
      return initial;
    },
  );

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children && isGroupActive(item)) {
        setExpandedGroups((prev) => ({ ...prev, [item.label]: true }));
      }
    });
  }, [pathname]);

  function toggleGroup(label: string) {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="flex flex-col w-65 shrink-0 bg-background border-r border-border-light min-h-full">
      <nav className="flex flex-col gap-1 px-4 pt-6">
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            const groupActive = isGroupActive(item);
            const expanded = expandedGroups[item.label] ?? false;
            const Icon = item.icon;

            return (
              <div key={item.label} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  className={[
                    "flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors w-full text-left",
                    groupActive && !expanded
                      ? "bg-primary text-white"
                      : groupActive
                        ? "text-primary"
                        : "text-text-secondary hover:bg-surface",
                  ].join(" ")}
                >
                  <Icon
                    size={18}
                    className={
                      groupActive && !expanded
                        ? "text-white"
                        : groupActive
                          ? "text-primary"
                          : "text-text-secondary"
                    }
                    aria-hidden="true"
                  />
                  {item.label}
                  <ChevronDown
                    size={14}
                    className={[
                      "ml-auto transition-transform",
                      expanded ? "rotate-180" : "",
                      groupActive && !expanded
                        ? "text-white"
                        : "text-text-muted",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </button>

                {expanded && (
                  <div className="flex flex-col gap-0.5 mt-0.5 ml-4 pl-3 border-l border-border-light">
                    {item.children.map((child) => {
                      const childActive = isActive(child.href);
                      const ChildIcon = child.icon;
                      const showBadge =
                        child.label === "Perfis" && childActive && classBadge;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={[
                            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors no-underline",
                            childActive
                              ? "bg-primary text-white"
                              : "text-text-secondary hover:bg-surface",
                          ].join(" ")}
                        >
                          <ChildIcon
                            size={16}
                            className={
                              childActive ? "text-white" : "text-text-secondary"
                            }
                            aria-hidden="true"
                          />
                          {child.label}
                          {showBadge && (
                            <span className="ml-auto text-[10px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded">
                              {classBadge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

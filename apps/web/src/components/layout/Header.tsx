import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface NavLink {
  label: string;
  href: string;
}

interface HeaderProps {
  navLinks?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

const defaultNavLinks: NavLink[] = [
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function Header({
  navLinks = defaultNavLinks,
  ctaLabel = "Acessar",
  ctaHref = "/login",
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0">
      <Link href="/" aria-label="Início — SCAE">
        <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
      </Link>

      <nav className="flex items-center gap-6" aria-label="Navegação principal">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors no-underline"
          >
            {link.label}
          </Link>
        ))}

        <Button variant="primary" size="sm" asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </nav>
    </header>
  );
}

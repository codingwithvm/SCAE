import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavLink {
  label: string;
  href: string;
}

interface HeaderPublicProps {
  variant?: "public";
  navLinks?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

interface HeaderAuthProps {
  variant: "auth";
  backHref?: string;
  backLabel?: string;
}

type HeaderProps = HeaderPublicProps | HeaderAuthProps;

const defaultNavLinks: NavLink[] = [
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function Header(props: HeaderProps) {
  const base =
    "flex items-center justify-between h-16 px-8 bg-background border-b border-border-light shrink-0";

  if (props.variant === "auth") {
    const { backHref = "/login", backLabel = "Voltar" } = props;
    return (
      <header className={base}>
        <Link href="/" aria-label="Início — SCAE">
          <Image src="/logo.png" alt="SCAE" width={116} height={32} priority />
        </Link>

        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity no-underline"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {backLabel}
        </Link>
      </header>
    );
  }

  const {
    navLinks = defaultNavLinks,
    ctaLabel = "Acessar",
    ctaHref = "/login",
  } = props as HeaderPublicProps;

  return (
    <header className={base}>
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

import Link from "next/link";
import type { ReactNode } from "react";
import { site, instagramUrl } from "@/config/site";
import { SunSymbol } from "./SunSymbol";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label={`${site.name}, página inicial`}>
      <SunSymbol size={30} />
      <span className="wordmark brand__name">{site.name}</span>
    </Link>
  );
}

export function BookingButton() {
  if (site.bookingsOpen) {
    return (
      <Link href="/anamnese" className="btn btn--primary">
        marcações
      </Link>
    );
  }
  return (
    <span className="btn btn--primary btn--soon" aria-disabled="true" title="As marcações ainda não estão abertas">
      marcações <small>em breve</small>
    </span>
  );
}

export function Navbar() {
  return (
    <header className="navbar">
      <div className="wrap navbar__inner">
        <Brand />
        <BookingButton />
      </div>
    </header>
  );
}

export function WhatsAppButton({ label = "WhatsApp", message }: { label?: string; message?: string }) {
  if (!site.whatsapp) {
    return (
      <button type="button" className="btn btn--whatsapp" disabled title="Número de WhatsApp por configurar">
        {label} <small>em breve</small>
      </button>
    );
  }
  const href = `https://wa.me/${site.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  return (
    <a className="btn btn--whatsapp" href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <span className="label">
          {site.name} · {site.tagline}
        </span>
        <nav className="footer__links" aria-label="Rodapé">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
          <Link href="/anamnese">ficha de anamnese</Link>
          <Link href="/portal">área de cliente</Link>
          <Link href="/privacidade">privacidade</Link>
        </nav>
      </div>
    </footer>
  );
}

/** Moldura estreita (~480px, tipo app) usada no portal e no painel. */
export function AppShell({ children, avatar, demo = true }: { children: ReactNode; avatar?: string; demo?: boolean }) {
  return (
    <div className="app">
      <header className="app__bar">
        <Brand />
        {avatar && <span className="avatar" aria-hidden="true">{avatar}</span>}
      </header>
      {demo && <p className="demo-banner">demonstração · dados fictícios, sem login nem base de dados</p>}
      <main className="app__main">{children}</main>
    </div>
  );
}

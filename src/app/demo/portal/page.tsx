import type { Metadata } from "next";
import { AppShell, WhatsAppButton } from "@/components/Chrome";
import { SunSymbol } from "@/components/SunSymbol";
import { site } from "@/config/site";
import { demoClient as c } from "@/data/demo";
import { BodyMap } from "@/app/portal/BodyMap";
import { ReferralQR } from "@/app/portal/ReferralQR";
import { SupportChat } from "@/app/portal/SupportChat";

export const metadata: Metadata = { title: "Área de cliente (demonstração)", robots: { index: false } };

export default function PortalPage() {
  const total = site.loyalty.total;
  const left = total - c.stamps;
  return (
    <AppShell avatar={c.initials} demo>
      <h1 className="title">Olá, {c.firstName}</h1>

      <section className="card" aria-labelledby="sessao-title">
        <p className="label" id="sessao-title">última sessão</p>
        <p className="session">
          {c.lastSession.date} · {c.lastSession.description} · <strong>{c.lastSession.price}</strong>
        </p>
      </section>

      <section className="card" aria-labelledby="selos-title">
        <div className="card__head">
          <h2 id="selos-title">selos</h2>
          <span className="pill">{c.stamps} de {total}</span>
        </div>
        <ul className="stamps" aria-label={`${c.stamps} de ${total} selos ganhos`}>
          {Array.from({ length: total }, (_, i) => (
            <li key={i}><SunSymbol size={44} state={i < c.stamps ? "earned" : "pending"} /></li>
          ))}
        </ul>
        <p className="muted">
          {left > 0
            ? `Faltam ${left} ${left === 1 ? "selo" : "selos"} para desbloqueares ${site.loyalty.reward}.`
            : `Desbloqueaste ${site.loyalty.reward}!`}
        </p>
      </section>

      <section className="card referral" aria-labelledby="ref-title">
        <ReferralQR code={c.referralCode} />
        <div>
          <h2 id="ref-title">traz alguém</h2>
          <p className="muted">
            Quem vier por tua indicação tem <strong>{site.referralDiscountPercent}% de desconto</strong> na primeira sessão.
          </p>
          <p className="code">{c.referralCode}</p>
        </div>
      </section>

      <BodyMap />
      <SupportChat />

      <WhatsAppButton label="continuar no WhatsApp" />
    </AppShell>
  );
}

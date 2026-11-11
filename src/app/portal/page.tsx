import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, WhatsAppButton } from "@/components/Chrome";
import { SunSymbol } from "@/components/SunSymbol";
import { site } from "@/config/site";
import { euros, shortDate } from "@/lib/format";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Entry } from "./BodyMap";
import { LiveBodyMap } from "./LiveBodyMap";
import { ReferralQR } from "./ReferralQR";
import { SupportChat, toMsgs } from "./SupportChat";

export const metadata: Metadata = { title: "Área de cliente", robots: { index: false } };

export default async function PortalPage() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/entrar?next=/portal");

  const [sessions, tattoos, tickets] = await Promise.all([
    supabase.from("sessions").select("session_date, description, price_cents").eq("client_id", user.id).order("session_date", { ascending: false }),
    supabase.from("tattoos").select("zone, pain_level, photo_path").eq("client_id", user.id),
    supabase.from("tickets").select("id, subject, status").eq("client_id", user.id).order("id", { ascending: false }).limit(1),
  ]);

  // fotos privadas: links temporários (1 hora)
  const paths = (tattoos.data ?? []).map((t) => t.photo_path).filter(Boolean) as string[];
  const signed = paths.length ? (await supabase.storage.from("tatuagens").createSignedUrls(paths, 3600)).data ?? [] : [];
  const urlOf = Object.fromEntries(signed.map((s) => [s.path, s.signedUrl]));
  const entries: Record<string, Entry> = Object.fromEntries(
    (tattoos.data ?? []).map((t) => [t.zone, { level: t.pain_level, photo: t.photo_path ? urlOf[t.photo_path] : undefined }]),
  );

  const ticket = tickets.data?.[0];
  const messages = ticket
    ? (await supabase.from("messages").select("sender_role, body").eq("ticket_id", ticket.id).order("id")).data ?? []
    : [];

  const name = profile.full_name?.trim().split(/\s+/)[0];
  const initials = (profile.full_name ?? user.email ?? "?").trim().split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const last = sessions.data?.[0];
  const total = site.loyalty.total;
  const count = sessions.data?.length ?? 0;
  const stamps = count > 0 && count % total === 0 ? total : count % total;
  const left = total - stamps;

  return (
    <AppShell avatar={initials}>
      <h1 className="title">Olá{name ? `, ${name}` : ""}</h1>
      {profile.role === "admin" && <Link className="link" href="/painel">ir para o painel →</Link>}

      <section className="card" aria-labelledby="sessao-title">
        <p className="label" id="sessao-title">última sessão</p>
        {last ? (
          <p className="session">
            {shortDate(last.session_date)} · {last.description} · <strong>{euros(last.price_cents)}</strong>
          </p>
        ) : (
          <p className="muted">Ainda não tens sessões registadas.</p>
        )}
      </section>

      <section className="card" aria-labelledby="selos-title">
        <div className="card__head">
          <h2 id="selos-title">selos</h2>
          <span className="pill">{stamps} de {total}</span>
        </div>
        <ul className="stamps" aria-label={`${stamps} de ${total} selos ganhos`}>
          {Array.from({ length: total }, (_, i) => (
            <li key={i}><SunSymbol size={44} state={i < stamps ? "earned" : "pending"} /></li>
          ))}
        </ul>
        <p className="muted">
          {left > 0
            ? `Faltam ${left} ${left === 1 ? "selo" : "selos"} para desbloqueares ${site.loyalty.reward}.`
            : `Desbloqueaste ${site.loyalty.reward}!`}
        </p>
      </section>

      <section className="card referral" aria-labelledby="ref-title">
        <ReferralQR code={profile.referral_code} />
        <div>
          <h2 id="ref-title">traz alguém</h2>
          <p className="muted">
            Quem vier por tua indicação tem <strong>{site.referralDiscountPercent}% de desconto</strong> na primeira sessão.
          </p>
          <p className="code">{profile.referral_code}</p>
        </div>
      </section>

      <LiveBodyMap userId={user.id} initial={entries} />

      {ticket ? (
        <SupportChat ticket={{ id: ticket.id, subject: ticket.subject, open: ticket.status === "open" }} initial={toMsgs(messages)} />
      ) : (
        <section className="card">
          <h2>cuidados pós-tattoo</h2>
          <p className="muted">Depois da tua primeira sessão abre-se aqui uma conversa para tirares dúvidas sobre os cuidados.</p>
        </section>
      )}

      <WhatsAppButton label="continuar no WhatsApp" />
    </AppShell>
  );
}

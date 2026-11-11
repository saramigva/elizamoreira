import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/Chrome";
import { site } from "@/config/site";
import type { Appointment } from "@/data/demo";
import { shortDate, ticketNumber } from "@/lib/format";
import { getSessionProfile } from "@/lib/supabase/server";
import { AppointmentForm, SessionForm } from "./AdminForms";
import { AvailabilityEditor, ConfirmSlotButton } from "./AvailabilityEditor";
import { Agenda } from "./Agenda";
import { Feedback } from "./Feedback";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

const TZ = "Europe/Lisbon";
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // AAAA-MM-DD
const timeOf = (d: Date) => new Intl.DateTimeFormat("pt-PT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);

export default async function PainelPage() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect("/entrar?next=/painel");
  if (profile?.role !== "admin") notFound();

  const today = dayKey(new Date());
  const [profiles, appointments, tickets, feedback, sessions, forms, rules, blocked, settings] = await Promise.all([
    supabase.from("profiles").select("id, full_name, referral_code, referred_by, role").order("created_at"),
    supabase.from("appointments").select("client_id, client_name, starts_at, zone, duration_minutes").order("starts_at"),
    supabase.from("tickets").select("id, client_id, subject, status").order("id", { ascending: false }).limit(50),
    supabase.from("feedback").select("source, author, stars, body").order("created_at", { ascending: false }),
    supabase.from("sessions").select("client_id"),
    supabase.from("anamnese_forms").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("availability").select("id, weekday, start_time, end_time"),
    supabase.from("blocked_dates").select("day, note").gte("day", today).order("day"),
    supabase.from("booking_settings").select("slot_minutes").single(),
  ]);
  const slotMinutes = settings.data?.slot_minutes ?? 120;
  const booked = new Set((appointments.data ?? []).map((a) => `${a.client_id}|${new Date(a.starts_at).getTime()}`));
  const slotLabel = (iso: string) =>
    new Intl.DateTimeFormat("pt-PT", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

  const nameOf = new Map((profiles.data ?? []).map((p) => [p.id, p.full_name || "(sem nome)"]));
  const clients = (profiles.data ?? []).map((p) => ({ id: p.id, name: p.full_name || "(sem nome)" }));
  const sessionCount = new Map<string, number>();
  (sessions.data ?? []).forEach((s) => sessionCount.set(s.client_id, (sessionCount.get(s.client_id) ?? 0) + 1));

  // agenda por dia (hora de Lisboa) e marcações dos próximos 7 dias
  const byDate: Record<string, Appointment[]> = {};
  const now = Date.now();
  let week = 0;
  for (const a of appointments.data ?? []) {
    const d = new Date(a.starts_at);
    (byDate[dayKey(d)] ??= []).push({ time: timeOf(d), client: a.client_name, zone: a.zone ?? "" });
    if (d.getTime() >= now && d.getTime() < now + 7 * 864e5) week++;
  }

  const fb = feedback.data ?? [];
  const rating = fb.length ? (fb.reduce((n, f) => n + f.stars, 0) / fb.length).toFixed(1).replace(".", ",") : "—";
  const bySource = (s: string) => fb.filter((f) => f.source === s).map((f) => ({ author: f.author, stars: f.stars, text: f.body }));
  const openTickets = (tickets.data ?? []).filter((t) => t.status === "open").length;

  // imagens de referência das fichas: links temporários (1 hora)
  const refPaths = (forms.data ?? []).map((f) => f.reference_path).filter(Boolean) as string[];
  const signed = refPaths.length ? (await supabase.storage.from("referencias").createSignedUrls(refPaths, 3600)).data ?? [] : [];
  const refUrl = Object.fromEntries(signed.map((s) => [s.path, s.signedUrl]));

  return (
    <AppShell avatar="EM">
      <h1 className="title">Painel</h1>

      <ul className="stats">
        <li><strong>{week}</strong><span>agendamentos nos próximos 7 dias</span></li>
        <li><strong>{openTickets}</strong><span>tickets abertos</span></li>
        <li><strong>{rating}</strong><span>avaliação média</span></li>
      </ul>

      <Agenda byDate={byDate} />
      <AppointmentForm clients={clients} slotMinutes={slotMinutes} />
      <AvailabilityEditor rules={rules.data ?? []} blocked={blocked.data ?? []} slotMinutes={slotMinutes} />

      <section className="card" aria-labelledby="tickets-title">
        <div className="card__head"><h2 id="tickets-title">tickets e chats</h2></div>
        {(tickets.data ?? []).length === 0 && <p className="muted">Ainda sem tickets. Abre-se um por cada sessão registada.</p>}
        <ul className="rows">
          {(tickets.data ?? []).map((t) => (
            <li key={t.id}>
              <Link href={`/painel/tickets/${t.id}`}><strong>{ticketNumber(t.id)}</strong></Link>
              <span>{nameOf.get(t.client_id)}<br /><span className="muted">{t.subject}</span></span>
              <span className={`pill ${t.status === "open" ? "pill--open" : "pill--closed"}`}>{t.status === "open" ? "aberto" : "fechado"}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card" aria-labelledby="clientes-title">
        <div className="card__head">
          <h2 id="clientes-title">clientes</h2>
          <span className="pill">{clients.length}</span>
        </div>
        <ul className="rows">
          {(profiles.data ?? []).map((p) => (
            <li key={p.id}>
              <strong>{p.referral_code}</strong>
              <span>
                {p.full_name || "(sem nome)"}
                {p.referred_by && <><br /><span className="muted">indicação de {nameOf.get(p.referred_by)} · {site.referralDiscountPercent}% na 1.ª sessão</span></>}
              </span>
              <span className="pill">{sessionCount.get(p.id) ?? 0} sessões</span>
            </li>
          ))}
        </ul>
        <SessionForm clients={clients} />
      </section>

      <section className="card" aria-labelledby="fichas-title">
        <div className="card__head">
          <h2 id="fichas-title">fichas de anamnese</h2>
          <span className="pill">{forms.data?.length ?? 0}</span>
        </div>
        {(forms.data ?? []).length === 0 && <p className="muted">Ainda sem fichas.</p>}
        <div>
          {(forms.data ?? []).map((f) => (
            <details key={f.id} className="row">
              <summary>
                <span>{f.full_name}</span>
                <span className="muted">{f.preferred_slot ? slotLabel(f.preferred_slot) : shortDate(f.created_at.slice(0, 10))}</span>
              </summary>
              <dl>
                <div>
                  <dt>horário pedido</dt>
                  <dd>{f.preferred_slot ? slotLabel(f.preferred_slot) : "a combinar"}</dd>
                </div>
                {f.preferred_slot && (
                  <div>
                    {booked.has(`${f.client_id}|${new Date(f.preferred_slot).getTime()}`) ? (
                      <dd>✓ marcação confirmada na agenda</dd>
                    ) : (
                      <ConfirmSlotButton clientId={f.client_id} name={f.full_name} startsAt={f.preferred_slot} minutes={slotMinutes} />
                    )}
                  </div>
                )}
                <div><dt>nascimento</dt><dd>{f.birth_date}</dd></div>
                <div><dt>contacto</dt><dd>{f.contact}</dd></div>
                <div><dt>alergias</dt><dd>{f.allergies}</dd></div>
                <div><dt>saúde / medicação</dt><dd>{f.health_notes}</dd></div>
                <div><dt>ideia</dt><dd>{f.idea}</dd></div>
                {f.reference_path && refUrl[f.reference_path] && (
                  <div><dt>referência</dt><dd><a href={refUrl[f.reference_path]} target="_blank" rel="noopener noreferrer">abrir imagem</a></dd></div>
                )}
              </dl>
            </details>
          ))}
        </div>
      </section>

      <Feedback data={{ site: bySource("site"), google: bySource("google") }} />
    </AppShell>
  );
}

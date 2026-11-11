import type { Metadata } from "next";
import { AppShell } from "@/components/Chrome";
import { demoSummary, demoTickets } from "@/data/demo";
import { Agenda } from "./Agenda";
import { Feedback } from "./Feedback";

export const metadata: Metadata = { title: "Painel", robots: { index: false } };

export default function PainelPage() {
  return (
    <AppShell avatar="EM">
      <h1 className="title">Painel</h1>

      <ul className="stats">
        <li><strong>{demoSummary.weekAppointments}</strong><span>agendamentos esta semana</span></li>
        <li><strong>{demoSummary.openTickets}</strong><span>tickets abertos</span></li>
        <li><strong>{demoSummary.rating}</strong><span>avaliação média</span></li>
      </ul>

      <Agenda />
      <Feedback />

      <section className="card" aria-labelledby="tickets-title">
        <div className="card__head">
          <h2 id="tickets-title">tickets e chats</h2>
        </div>
        <ul className="rows">
          {demoTickets.map((t) => (
            <li key={t.id}>
              <strong>{t.id}</strong>
              <span>{t.client}<br /><span className="muted">{t.subject}</span></span>
              <span className={`pill ${t.open ? "pill--open" : "pill--closed"}`}>{t.open ? "aberto" : "fechado"}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}

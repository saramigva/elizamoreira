"use client";

import { useEffect, useState } from "react";
import { demoAppointments, type Appointment } from "@/data/demo";

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

/** `byDate`: marcações por data ("AAAA-MM-DD"). Sem ele, mostra os dados de demonstração. */
export function Agenda({ byDate }: { byDate?: Record<string, Appointment[]> }) {
  // A data só é lida no browser, para o HTML do servidor não depender do fuso horário.
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState(1);
  useEffect(() => {
    const d = new Date();
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setDay(d.getDate());
  }, []);

  if (!view) return <section className="card agenda" aria-busy="true"><h2>agenda</h2></section>;

  const { y, m } = view;
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // semana começa à segunda
  const days = new Date(y, m + 1, 0).getDate();
  const selected = Math.min(day, days);
  const on = (n: number): Appointment[] =>
    (byDate ? byDate[`${y}-${String(m + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`] : demoAppointments[n]) ?? [];
  const list = on(selected);
  const go = (delta: number) => {
    const d = new Date(y, m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <section className="card agenda" aria-labelledby="agenda-title">
      <div className="card__head">
        <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Mês anterior">‹</button>
        <h2 id="agenda-title" aria-live="polite">{MONTHS[m]} {y}</h2>
        <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Mês seguinte">›</button>
      </div>
      <div className="cal">
        {WEEKDAYS.map((d) => <span key={d} className="cal__wd">{d}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`o${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const n = i + 1;
          const has = on(n).length > 0;
          return (
            <button
              key={n}
              type="button"
              className="cal__day"
              aria-pressed={n === selected}
              aria-label={`${n} de ${MONTHS[m]}${has ? ", com marcações" : ""}`}
              onClick={() => setDay(n)}
            >
              {n}
              {has && <i className="cal__dot" />}
            </button>
          );
        })}
      </div>
      <div className="agenda__detail">
        <p className="label">{selected} de {MONTHS[m]}</p>
        {list.length === 0 ? (
          <p className="muted">Sem marcações neste dia.</p>
        ) : (
          <ul className="rows">
            {list.map((a) => (
              <li key={a.time + a.client}><strong>{a.time}</strong><span>{a.client}</span><span className="muted">{a.zone}</span></li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

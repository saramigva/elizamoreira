"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export type Rule = { id: string; weekday: number; start_time: string; end_time: string };
export type Blocked = { day: string; note: string | null };

const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
const DURATIONS = [60, 90, 120, 180, 240, 300];
const hm = (t: string) => t.slice(0, 5);
const durationLabel = (m: number) => (m % 60 ? `${Math.floor(m / 60)}h${m % 60}` : `${m / 60}h`);
const dayLabel = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(Date.UTC(y, m - 1, d));
};

/** Horário semanal, dias fechados e duração de cada sessão (só a Eliza). */
export function AvailabilityEditor({ rules, blocked, slotMinutes }: { rules: Rule[]; blocked: Blocked[]; slotMinutes: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => PromiseLike<{ error: unknown }>) {
    setBusy(true);
    setError("");
    const { error } = await action();
    setBusy(false);
    if (error) {
      setError("Não foi possível guardar. Confirma os campos e tenta de novo.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function addRule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const start = String(f.get("inicio"));
    const end = String(f.get("fim"));
    if (end <= start) return setError("A hora de fim tem de ser depois da hora de início.");
    if (await run(() => createClient().from("availability").insert({ weekday: Number(f.get("dia")), start_time: start, end_time: end }))) form.reset();
  }

  async function addBlocked(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const ok = await run(() =>
      createClient().from("blocked_dates").upsert({ day: String(f.get("data")), note: String(f.get("nota") || "").trim() || null }),
    );
    if (ok) form.reset();
  }

  const byDay = (d: number) => rules.filter((r) => r.weekday === d).sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <section className="card" aria-labelledby="horarios-title">
      <div className="card__head">
        <h2 id="horarios-title">horários livres</h2>
      </div>
      <p className="muted">
        As clientes veem os horários livres dos próximos 30 dias na ficha de anamnese e escolhem um. As horas com marcação ficam
        ocupadas sozinhas.
      </p>

      <div className="field">
        <label htmlFor="hr-duracao">duração de cada sessão</label>
        <select
          id="hr-duracao"
          value={slotMinutes}
          disabled={busy}
          onChange={(e) => run(() => createClient().from("booking_settings").update({ slot_minutes: Number(e.target.value) }).eq("id", true))}
        >
          {DURATIONS.map((m) => <option key={m} value={m}>{durationLabel(m)}</option>)}
        </select>
      </div>

      <ul className="week" aria-label="Horário semanal">
        {WEEKDAYS.map((label, i) => {
          const list = byDay(i + 1);
          return (
            <li key={label}>
              <strong>{label}</strong>
              {list.length === 0 ? (
                <span className="muted">fechado</span>
              ) : (
                <span className="tags">
                  {list.map((r) => (
                    <span key={r.id} className="tag">
                      {hm(r.start_time)}–{hm(r.end_time)}
                      <button
                        type="button"
                        aria-label={`Remover ${label} ${hm(r.start_time)} a ${hm(r.end_time)}`}
                        disabled={busy}
                        onClick={() => run(() => createClient().from("availability").delete().eq("id", r.id))}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <form className="subform" onSubmit={addRule}>
        <p className="label">adicionar horário</p>
        <div className="field-row">
          <div className="field">
            <label htmlFor="hr-dia">dia</label>
            <select id="hr-dia" name="dia" defaultValue="1">
              {WEEKDAYS.map((label, i) => <option key={label} value={i + 1}>{label}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="hr-inicio">das</label><input id="hr-inicio" name="inicio" type="time" required /></div>
          <div className="field"><label htmlFor="hr-fim">às</label><input id="hr-fim" name="fim" type="time" required /></div>
        </div>
        <button type="submit" className="btn btn--primary" disabled={busy}>adicionar</button>
      </form>

      <div className="field">
        <p className="label">dias fechados</p>
        {blocked.length === 0 ? (
          <p className="muted">Nenhum dia fechado.</p>
        ) : (
          <span className="tags">
            {blocked.map((b) => (
              <span key={b.day} className="tag">
                {dayLabel(b.day)}{b.note ? ` · ${b.note}` : ""}
                <button
                  type="button"
                  aria-label={`Reabrir ${dayLabel(b.day)}`}
                  disabled={busy}
                  onClick={() => run(() => createClient().from("blocked_dates").delete().eq("day", b.day))}
                >
                  ×
                </button>
              </span>
            ))}
          </span>
        )}
      </div>

      <form className="subform" onSubmit={addBlocked}>
        <p className="label">fechar um dia</p>
        <div className="field-row">
          <div className="field"><label htmlFor="bl-data">data</label><input id="bl-data" name="data" type="date" required /></div>
          <div className="field"><label htmlFor="bl-nota">motivo (opcional)</label><input id="bl-nota" name="nota" type="text" placeholder="ex.: férias" /></div>
        </div>
        <button type="submit" className="btn btn--primary" disabled={busy}>fechar dia</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
    </section>
  );
}

/** Confirma o horário pedido numa ficha: cria a marcação na agenda. */
export function ConfirmSlotButton({ clientId, name, startsAt, minutes }: { clientId: string; name: string; startsAt: string; minutes: number }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  async function confirm() {
    setState("busy");
    const { error } = await createClient()
      .from("appointments")
      .insert({ client_id: clientId, client_name: name, starts_at: startsAt, duration_minutes: minutes });
    if (error) return setState("error");
    router.refresh();
  }
  return (
    <>
      <button type="button" className="btn btn--primary" onClick={confirm} disabled={state === "busy"}>
        confirmar marcação
      </button>
      {state === "error" && <p className="error" role="alert">Não foi possível criar a marcação.</p>}
    </>
  );
}

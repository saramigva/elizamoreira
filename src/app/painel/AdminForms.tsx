"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Client = { id: string; name: string };

function useSubmit() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(form: HTMLFormElement, action: (f: FormData) => PromiseLike<{ error: unknown }>, done: string) {
    setBusy(true);
    setMsg(null);
    const { error } = await action(new FormData(form));
    setBusy(false);
    if (error) return setMsg({ ok: false, text: "Não foi possível guardar. Confirma os campos e tenta de novo." });
    form.reset();
    setMsg({ ok: true, text: done });
    router.refresh();
  }
  return { msg, busy, run };
}

const Status = ({ msg }: { msg: { ok: boolean; text: string } | null }) =>
  msg && <p className={msg.ok ? "muted" : "error"} role={msg.ok ? "status" : "alert"}>{msg.text}</p>;

export function AppointmentForm({ clients, slotMinutes }: { clients: Client[]; slotMinutes: number }) {
  const { msg, busy, run } = useSubmit();
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    run(e.currentTarget, (f) => {
      const clientId = String(f.get("cliente") || "");
      const typed = String(f.get("nome") || "").trim();
      const name = typed || clients.find((c) => c.id === clientId)?.name || "";
      if (!name) return Promise.resolve({ error: "nome" });
      // a hora é interpretada no fuso horário deste dispositivo
      const startsAt = new Date(`${f.get("data")}T${f.get("hora")}`).toISOString();
      return createClient().from("appointments").insert({
        client_id: clientId || null,
        client_name: name,
        starts_at: startsAt,
        zone: String(f.get("zona") || "") || null,
        duration_minutes: Number(f.get("duracao")) || slotMinutes,
      });
    }, "Marcação adicionada.");
  }
  return (
    <form className="subform" onSubmit={onSubmit}>
      <p className="label">nova marcação</p>
      <div className="field-row">
        <div className="field"><label htmlFor="ap-data">data</label><input id="ap-data" name="data" type="date" required /></div>
        <div className="field"><label htmlFor="ap-hora">hora</label><input id="ap-hora" name="hora" type="time" required /></div>
        <div className="field">
          <label htmlFor="ap-duracao">duração (min)</label>
          <input id="ap-duracao" name="duracao" type="number" min="15" max="720" step="15" defaultValue={slotMinutes} required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="ap-cliente">cliente com conta (opcional)</label>
        <select id="ap-cliente" name="cliente" defaultValue="">
          <option value="">—</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="field-row">
        <div className="field"><label htmlFor="ap-nome">nome (se não tem conta)</label><input id="ap-nome" name="nome" type="text" /></div>
        <div className="field"><label htmlFor="ap-zona">zona</label><input id="ap-zona" name="zona" type="text" /></div>
      </div>
      <Status msg={msg} />
      <button type="submit" className="btn btn--primary" disabled={busy}>adicionar</button>
    </form>
  );
}

export function SessionForm({ clients }: { clients: Client[] }) {
  const { msg, busy, run } = useSubmit();
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    run(e.currentTarget, (f) =>
      createClient().from("sessions").insert({
        client_id: String(f.get("cliente")),
        session_date: String(f.get("data")),
        description: String(f.get("descricao")).trim(),
        price_cents: Math.round(Number(f.get("valor")) * 100),
      }), "Sessão registada: o cliente ganhou um selo e abriu-se um ticket de cuidados.");
  }
  return (
    <form className="subform" onSubmit={onSubmit}>
      <p className="label">registar sessão</p>
      <div className="field">
        <label htmlFor="se-cliente">cliente</label>
        <select id="se-cliente" name="cliente" required defaultValue="">
          <option value="" disabled>escolhe…</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="field-row">
        <div className="field"><label htmlFor="se-data">data</label><input id="se-data" name="data" type="date" required /></div>
        <div className="field"><label htmlFor="se-valor">valor pago (€)</label><input id="se-valor" name="valor" type="number" min="0" step="0.01" required /></div>
      </div>
      <div className="field"><label htmlFor="se-desc">descrição</label><input id="se-desc" name="descricao" type="text" placeholder="ex.: blackwork antebraço" required /></div>
      <Status msg={msg} />
      <button type="submit" className="btn btn--primary" disabled={busy}>registar</button>
    </form>
  );
}

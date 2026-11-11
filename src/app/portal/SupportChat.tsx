"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ticketNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

export type Msg = { from: "cliente" | "agente" | "eliza" | "sistema"; text: string };
type Ticket = { id: number; subject: string; open: boolean };

/**
 * Conversa de demonstração. As respostas do agente são marcadores de posição:
 * as regras de cuidados pós-tattoo vão ser fornecidas pela Eliza e o agente
 * só deve responder com base nelas (nunca inventar aconselhamento médico).
 */
const DEMO: Msg[] = [
  { from: "cliente", text: "Olá! Posso ir à praia este fim de semana?" },
  {
    from: "agente",
    text: "[Resposta de exemplo] Aqui o assistente responde com base nas regras de cuidados definidas pela Eliza. Queres que a Eliza confirme no teu caso?",
  },
  { from: "cliente", text: "Sim, por favor." },
  { from: "sistema", text: "Eliza entrou na conversa" },
  { from: "eliza", text: "Olá, Ana! Vi a tua pergunta, já te respondo." },
];

const ROLE_TO_FROM = { client: "cliente", agent: "agente", eliza: "eliza" } as const;
export const toMsgs = (rows: { sender_role: string; body: string }[]): Msg[] =>
  rows.map((r) => ({ from: ROLE_TO_FROM[r.sender_role as keyof typeof ROLE_TO_FROM] ?? "agente", text: r.body }));

/** Insere o marcador «Eliza entrou na conversa» antes da primeira mensagem dela. */
function withMarker(msgs: Msg[]): Msg[] {
  const i = msgs.findIndex((m) => m.from === "eliza");
  if (i < 0 || msgs.some((m) => m.from === "sistema")) return msgs;
  return [...msgs.slice(0, i), { from: "sistema", text: "Eliza entrou na conversa" }, ...msgs.slice(i)];
}

/**
 * Sem `ticket`: demonstração em memória.
 * Com `ticket`: lê e escreve na base de dados. `as` indica quem está a escrever.
 */
export function SupportChat({ ticket, initial, as = "client" }: { ticket?: Ticket; initial?: Msg[]; as?: "client" | "eliza" }) {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>(initial ?? DEMO);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const who: Record<Msg["from"], string> =
    as === "eliza"
      ? { cliente: "cliente", agente: "assistente", eliza: "tu", sistema: "" }
      : { cliente: "tu", agente: "assistente", eliza: "Eliza", sistema: "" };

  // Atualiza a conversa de 15 em 15 segundos.
  useEffect(() => {
    if (!ticket) return;
    const supabase = createClient();
    const load = async () => {
      const { data } = await supabase.from("messages").select("sender_role, body").eq("ticket_id", ticket.id).order("id");
      if (data) setMsgs(toMsgs(data));
    };
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [ticket]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setError("");
    if (!ticket) {
      setMsgs([
        ...msgs,
        { from: "cliente", text: t },
        { from: "agente", text: "[Demonstração] O assistente ainda não está ligado. As respostas reais vão seguir as regras de cuidados da Eliza." },
      ]);
    } else {
      const { error } = await createClient().from("messages").insert({ ticket_id: ticket.id, sender_role: as, body: t });
      if (error) return setError("A mensagem não foi enviada. Tenta de novo.");
      setMsgs([...msgs, { from: as === "eliza" ? "eliza" : "cliente", text: t }]);
    }
    setText("");
  }

  async function toggle() {
    if (!ticket) return;
    const { error } = await createClient().from("tickets").update({ status: ticket.open ? "closed" : "open" }).eq("id", ticket.id);
    if (error) return setError("Não foi possível alterar o estado do ticket.");
    router.refresh();
  }

  const open = ticket ? ticket.open : true;
  return (
    <section className="card chat" aria-labelledby="chat-title">
      <div className="card__head">
        <h2 id="chat-title">{ticket?.subject ?? "cuidados pós-tattoo"}</h2>
        <span className={`pill ${open ? "pill--open" : "pill--closed"}`}>
          {ticket ? ticketNumber(ticket.id) : "#032"} · {open ? "aberto" : "fechado"}
        </span>
      </div>
      {ticket && msgs.length === 0 && (
        <p className="muted">
          {as === "eliza" ? "Ainda sem mensagens." : "Tens dúvidas sobre os cuidados com a tua tatuagem? Escreve aqui e a Eliza responde assim que puder."}
        </p>
      )}
      <ol className="chat__log" aria-live="polite">
        {withMarker(msgs).map((m, i) =>
          m.from === "sistema" ? (
            <li key={i} className="chat__marker">{m.text}</li>
          ) : (
            <li key={i} className={`bubble bubble--${m.from}`}>
              <span className="bubble__who">{who[m.from]}</span>
              {m.text}
            </li>
          ),
        )}
      </ol>
      {error && <p className="error" role="alert">{error}</p>}
      {open ? (
        <form className="chat__form" onSubmit={send}>
          <label htmlFor="chat-msg" className="visually-hidden">Mensagem</label>
          <input id="chat-msg" value={text} onChange={(e) => setText(e.target.value)} placeholder={as === "eliza" ? "responder…" : "escreve a tua dúvida…"} autoComplete="off" maxLength={4000} />
          <button type="submit" className="btn btn--primary">enviar</button>
        </form>
      ) : (
        <p className="muted">Este ticket está fechado.</p>
      )}
      {ticket && as === "eliza" && (
        <button type="button" className="btn btn--ghost" onClick={toggle}>{ticket.open ? "fechar ticket" : "reabrir ticket"}</button>
      )}
    </section>
  );
}

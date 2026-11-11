"use client";

import { useState, type FormEvent } from "react";

type Msg = { from: "cliente" | "agente" | "eliza" | "sistema"; text: string };

/**
 * Conversa de demonstração. As respostas do agente são marcadores de posição:
 * as regras de cuidados pós-tattoo vão ser fornecidas pela Eliza e o agente
 * só deve responder com base nelas (nunca inventar aconselhamento médico).
 */
const INITIAL: Msg[] = [
  { from: "cliente", text: "Olá! Posso ir à praia este fim de semana?" },
  {
    from: "agente",
    text: "[Resposta de exemplo] Aqui o assistente responde com base nas regras de cuidados definidas pela Eliza. Queres que a Eliza confirme no teu caso?",
  },
  { from: "cliente", text: "Sim, por favor." },
  { from: "sistema", text: "Eliza entrou na conversa" },
  { from: "eliza", text: "Olá, Ana! Vi a tua pergunta, já te respondo." },
];

const WHO: Record<Msg["from"], string> = { cliente: "tu", agente: "assistente", eliza: "Eliza", sistema: "" };

export function SupportChat() {
  const [msgs, setMsgs] = useState(INITIAL);
  const [text, setText] = useState("");

  function send(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setMsgs([
      ...msgs,
      { from: "cliente", text: t },
      { from: "agente", text: "[Demonstração] O assistente ainda não está ligado. As respostas reais vão seguir as regras de cuidados da Eliza." },
    ]);
    setText("");
  }

  return (
    <section className="card chat" aria-labelledby="chat-title">
      <div className="card__head">
        <h2 id="chat-title">cuidados pós-tattoo</h2>
        <span className="pill pill--open">#032 · aberto</span>
      </div>
      <ol className="chat__log" aria-live="polite">
        {msgs.map((m, i) =>
          m.from === "sistema" ? (
            <li key={i} className="chat__marker">{m.text}</li>
          ) : (
            <li key={i} className={`bubble bubble--${m.from}`}>
              <span className="bubble__who">{WHO[m.from]}</span>
              {m.text}
            </li>
          ),
        )}
      </ol>
      <form className="chat__form" onSubmit={send}>
        <label htmlFor="chat-msg" className="visually-hidden">Mensagem</label>
        <input id="chat-msg" value={text} onChange={(e) => setText(e.target.value)} placeholder="escreve a tua dúvida…" autoComplete="off" />
        <button type="submit" className="btn btn--primary">enviar</button>
      </form>
    </section>
  );
}

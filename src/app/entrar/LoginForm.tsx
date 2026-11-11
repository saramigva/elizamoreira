"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    let ref = "";
    try {
      ref = localStorage.getItem("ref") ?? "";
    } catch {}
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: { full_name: String(form.get("nome") ?? ""), ref },
      },
    });
    if (error) {
      setError("Não foi possível enviar o e-mail. Confirma o endereço e tenta de novo daqui a um minuto.");
      setState("idle");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="card notice" role="status">
        <h2>Vê o teu e-mail</h2>
        <p>Enviámos um link de acesso para <strong>{email}</strong>. Abre-o neste dispositivo para entrares.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="card">
        <div className="field">
          <label htmlFor="email">e-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="nome">nome (só na primeira vez)</label>
          <input id="nome" name="nome" type="text" autoComplete="name" />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
      </div>
      <button type="submit" className="btn btn--primary btn--block" disabled={state === "sending"}>
        {state === "sending" ? "a enviar…" : "receber link de acesso"}
      </button>
    </form>
  );
}

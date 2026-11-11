"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export type SlotGroup = { label: string; slots: { value: string; time: string }[] };

/** Guarda a ficha na base de dados (só a própria pessoa e a Eliza a conseguem ler). */
export function AnamneseForm({ userId, defaultName, slots }: { userId: string; defaultName: string; slots: SlotGroup[] }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    setError("");
    const supabase = createClient();

    let referencePath: string | null = null;
    const file = f.get("referencia");
    if (file instanceof File && file.size > 0) {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      referencePath = `${userId}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from("referencias").upload(referencePath, file, { contentType: file.type });
      if (up.error) {
        setError("Não foi possível carregar a imagem. Usa JPG, PNG ou WebP até 5 MB.");
        return setState("idle");
      }
    }

    const { error } = await supabase.from("anamnese_forms").insert({
      full_name: String(f.get("nome")).trim(),
      birth_date: String(f.get("nascimento")),
      contact: String(f.get("contacto")).trim(),
      allergies: String(f.get("alergias")).trim(),
      health_notes: String(f.get("saude")).trim(),
      idea: String(f.get("ideia")).trim(),
      reference_path: referencePath,
      preferred_slot: String(f.get("horario") || "") || null,
    });
    if (error) {
      if (referencePath) await supabase.storage.from("referencias").remove([referencePath]);
      setError(
        error.message.includes("já não está livre")
          ? "Esse horário acabou de ser ocupado. Escolhe outro e envia de novo."
          : "A ficha não foi enviada. Tenta de novo.",
      );
      return setState("idle");
    }
    setState("sent");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (state === "sent") {
    return (
      <div className="card notice" role="status">
        <h2>Ficha enviada</h2>
        <p>Obrigada! A Eliza recebeu a tua ficha e entra em contacto contigo para confirmar a marcação.</p>
        <Link href="/portal" className="btn btn--ghost">ir para a área de cliente</Link>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <fieldset className="card">
        <legend className="label">os teus dados</legend>
        <div className="field">
          <label htmlFor="nome">nome completo</label>
          <input id="nome" name="nome" type="text" autoComplete="name" defaultValue={defaultName} required />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="nascimento">data de nascimento</label>
            <input id="nascimento" name="nascimento" type="date" autoComplete="bday" required />
          </div>
          <div className="field">
            <label htmlFor="contacto">contacto</label>
            <input id="contacto" name="contacto" type="text" placeholder="telemóvel ou e-mail" required />
          </div>
        </div>
      </fieldset>

      <fieldset className="card">
        <legend className="label">saúde</legend>
        <div className="field">
          <label htmlFor="alergias">alergias conhecidas</label>
          <textarea id="alergias" name="alergias" rows={2} placeholder="ex.: látex, pigmentos, adesivos. Se não tens, escreve «nenhuma»." required />
        </div>
        <div className="field">
          <label htmlFor="saude">condições de saúde / medicação</label>
          <textarea id="saude" name="saude" rows={3} placeholder="Se não tens, escreve «nenhuma»." required />
        </div>
      </fieldset>

      <fieldset className="card">
        <legend className="label">a tua ideia para a tatuagem</legend>
        <div className="field">
          <label htmlFor="ideia">descrição</label>
          <textarea id="ideia" name="ideia" rows={4} placeholder="estilo, tamanho, zona do corpo" required />
        </div>
        <div className="field">
          <label htmlFor="referencia">imagem de referência (opcional)</label>
          <label className="file" htmlFor="referencia">
            <span className="btn btn--ghost">anexar imagem</span>
            <span className="muted">{fileName || "nenhum ficheiro escolhido"}</span>
          </label>
          <input
            id="referencia"
            name="referencia"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="visually-hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </div>
      </fieldset>

      <fieldset className="card">
        <legend className="label">quando te dá jeito</legend>
        {slots.length === 0 ? (
          <p className="muted">De momento não há horários livres para escolher. A Eliza contacta-te para combinar a data.</p>
        ) : (
          <div className="field">
            <label htmlFor="horario">horário preferido</label>
            <select id="horario" name="horario" defaultValue="">
              <option value="">sem preferência, combinamos depois</option>
              {slots.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.slots.map((s) => <option key={s.value} value={s.value}>{g.label} · {s.time}</option>)}
                </optgroup>
              ))}
            </select>
            <p className="muted">A marcação só fica fechada quando a Eliza a confirmar.</p>
          </div>
        )}
      </fieldset>

      <label className="consent" htmlFor="consentimento">
        <input id="consentimento" name="consentimento" type="checkbox" required />
        <span>
          Dou o meu consentimento explícito para que a Eliza Moreira trate os dados de saúde desta ficha, apenas para
          preparar e realizar a minha tatuagem em segurança, nos termos da{" "}
          <Link href="/privacidade">política de privacidade</Link>.
        </span>
      </label>

      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn btn--primary btn--block" disabled={state === "sending"}>
        {state === "sending" ? "a enviar…" : "enviar ficha"}
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function AnamneseForm() {
  const [sent, setSent] = useState(false);
  const [fileName, setFileName] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO (backend): enviar para armazenamento seguro com acesso restrito à Eliza.
    // Até lá, nada sai do browser.
    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (sent) {
    return (
      <div className="card notice" role="status">
        <h2>Pré-visualização concluída</h2>
        <p>
          A ficha ainda não está ligada a um sistema de armazenamento seguro, por isso <strong>nada foi enviado nem
          guardado</strong>. Quando as marcações abrirem, este passo entrega a ficha diretamente à Eliza.
        </p>
        <button type="button" className="btn btn--ghost" onClick={() => setSent(false)}>
          voltar à ficha
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <fieldset className="card">
        <legend className="label">os teus dados</legend>
        <div className="field">
          <label htmlFor="nome">nome completo</label>
          <input id="nome" name="nome" type="text" autoComplete="name" required />
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
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </div>
      </fieldset>

      <label className="consent" htmlFor="consentimento">
        <input id="consentimento" name="consentimento" type="checkbox" required />
        <span>
          Dou o meu consentimento explícito para que a Eliza Moreira trate os dados de saúde desta ficha, apenas para
          preparar e realizar a minha tatuagem em segurança, nos termos da{" "}
          <Link href="/privacidade">política de privacidade</Link>.
        </span>
      </label>

      <button type="submit" className="btn btn--primary btn--block">
        enviar ficha
      </button>
    </form>
  );
}

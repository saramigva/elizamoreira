import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Navbar } from "@/components/Chrome";
import { getSessionProfile } from "@/lib/supabase/server";
import { AnamneseForm } from "./AnamneseForm";

export const metadata: Metadata = { title: "Ficha de anamnese" };

export default async function AnamnesePage() {
  const { user, profile } = await getSessionProfile();
  return (
    <>
      <Navbar />
      <main className="wrap page page--narrow">
        <p className="label">antes da sessão</p>
        <h1 className="title">Ficha de anamnese</h1>
        <p className="lead">
          Estas perguntas ajudam a preparar a tua sessão em segurança. As respostas sobre saúde são confidenciais e só a
          Eliza as lê.
        </p>
        {user ? (
          <AnamneseForm userId={user.id} defaultName={profile?.full_name ?? ""} />
        ) : (
          <div className="card notice">
            <h2>Entra primeiro na tua conta</h2>
            <p>Como a ficha tem dados de saúde, fica associada à tua conta para que só tu e a Eliza a possam ver.</p>
            <Link href="/entrar?next=/anamnese" className="btn btn--primary">entrar ou criar conta</Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

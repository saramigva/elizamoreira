import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer, Navbar } from "@/components/Chrome";
import { safeNext } from "@/lib/format";
import { getSessionProfile } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const { user } = await getSessionProfile();
  if (user) redirect(next);
  return (
    <>
      <Navbar />
      <main className="wrap page page--narrow">
        <p className="label">área de cliente</p>
        <h1 className="title">Entrar</h1>
        <p className="lead">Sem palavra-passe: escreve o teu e-mail e recebes um link para entrar ou criar a tua conta.</p>
        {params.erro && <p className="error" role="alert">O link expirou ou já foi usado. Pede um novo.</p>}
        <LoginForm next={next} />
      </main>
      <Footer />
    </>
  );
}

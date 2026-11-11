import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/Chrome";
import { AnamneseForm } from "./AnamneseForm";

export const metadata: Metadata = { title: "Ficha de anamnese" };

export default function AnamnesePage() {
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
        <AnamneseForm />
      </main>
      <Footer />
    </>
  );
}

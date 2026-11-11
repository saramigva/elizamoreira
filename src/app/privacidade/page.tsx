import type { Metadata } from "next";
import { Footer, Navbar } from "@/components/Chrome";

export const metadata: Metadata = { title: "Política de privacidade" };

export default function PrivacidadePage() {
  return (
    <>
      <Navbar />
      <main className="wrap page page--narrow prose">
        <p className="label">rascunho · a rever antes de publicar</p>
        <h1 className="title">Política de privacidade</h1>
        <p className="lead">
          Este texto é um ponto de partida e deve ser revisto por um profissional antes de o site recolher dados reais.
          Os campos entre parênteses retos estão por definir.
        </p>

        <h2>Quem trata os teus dados</h2>
        <p>Eliza Moreira, tatuadora independente em Lisboa. Contacto para questões de privacidade: [e-mail a definir].</p>

        <h2>Que dados são recolhidos</h2>
        <ul>
          <li>Identificação e contacto: nome completo, data de nascimento, telemóvel ou e-mail.</li>
          <li>Dados de saúde: alergias conhecidas, condições de saúde e medicação.</li>
          <li>A tua ideia para a tatuagem e imagens de referência que anexes.</li>
        </ul>

        <h2>Para quê e com que fundamento</h2>
        <p>
          Os dados servem apenas para preparar e realizar a tua tatuagem em segurança. Os dados de saúde são uma
          categoria especial no RGPD e só são tratados com o teu consentimento explícito, dado na ficha de anamnese
          (artigo 9.º, n.º 2, alínea a)). Podes retirar o consentimento em qualquer momento.
        </p>

        <h2>Quem tem acesso</h2>
        <p>Apenas a Eliza. Os dados não são vendidos nem partilhados para fins de marketing.</p>

        <h2>Durante quanto tempo</h2>
        <p>[Prazo de conservação a definir.]</p>

        <h2>Os teus direitos</h2>
        <p>
          Podes pedir acesso, retificação, apagamento, limitação ou portabilidade dos teus dados, e apresentar
          reclamação à Comissão Nacional de Proteção de Dados (CNPD).
        </p>
      </main>
      <Footer />
    </>
  );
}

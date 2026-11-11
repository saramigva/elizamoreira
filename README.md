# Eliza Moreira Tattoo

Site da Eliza Moreira, tatuadora independente em Lisboa. Next.js (App Router) + TypeScript, CSS simples com tokens de design.

## Correr localmente

```bash
npm install
npm run dev
```

## Páginas

| Rota | O que é | Estado |
| --- | --- | --- |
| `/` | Site público: navbar, hero, faixa portfólio / estúdio / contacto, sobre | pronto |
| `/anamnese` | Ficha de anamnese | só interface: **não envia nem guarda dados** |
| `/privacidade` | Política de privacidade | rascunho, a rever |
| `/portal` | Portal do cliente: última sessão, selos, QR de referência, mapa corporal, chat pós-tattoo | demonstração com dados fictícios |
| `/painel` | Painel da tatuadora: resumo, agenda mensal, feedback, tickets | demonstração com dados fictícios |

## Onde mexer

- `src/config/site.ts`: textos base, Instagram, WhatsApp e todas as decisões «a confirmar» (marcações abertas ou «em breve», localização, selos, sinal).
- `src/app/globals.css`: tokens de cor e tipografia (topo do ficheiro) e componentes.
- `src/components/SunSymbol.tsx` e `src/app/icon.svg`: símbolo da marca. Para trocar pelo símbolo definitivo, basta substituir estes dois.
- `src/data/demo.ts`: dados fictícios do portal e do painel.

## Por fazer (backend)

Contas e login, base de dados, armazenamento seguro da ficha de anamnese (dados de saúde, RGPD), pagamentos do sinal (Stripe), agente de suporte com as regras de cuidados da Eliza, validação dos códigos de referência.

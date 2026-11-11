# Eliza Moreira Tattoo

Site da Eliza Moreira, tatuadora independente em Lisboa. Next.js (App Router) + TypeScript, CSS simples com tokens de design.

## Correr localmente

```bash
npm install
npm run dev
```

## Páginas

| Rota | O que é |
| --- | --- |
| `/` | Site público |
| `/entrar` | Login sem palavra-passe (link por e-mail) |
| `/anamnese` | Ficha de anamnese (exige login; guarda na base de dados) |
| `/portal` | Portal do cliente: última sessão, selos, QR de referência, mapa corporal, chat pós-tattoo |
| `/painel` | Painel da Eliza (só `role = admin`): agenda, tickets, clientes, sessões, fichas, feedback |
| `/demo/portal`, `/demo/painel` | Os mesmos ecrãs com dados fictícios, para rever o design |
| `/privacidade` | Política de privacidade (rascunho, a rever) |

## Onde mexer

- `src/config/site.ts`: textos base, Instagram, WhatsApp e todas as decisões «a confirmar».
- `src/app/globals.css`: tokens de cor e tipografia (topo do ficheiro) e componentes.
- `src/components/SunSymbol.tsx` e `src/app/icon.svg`: símbolo da marca.
- `supabase/migrations/`: esquema da base de dados e regras de acesso (RLS).

## Backend (Supabase)

Projeto `elizamoreira` (eu-west-3). Variáveis em `.env.example`; copiar para `.env.local`.

- Cada cliente só lê os próprios dados; a Eliza lê tudo. Fotos e referências ficam em buckets privados.
- Registar uma sessão no painel dá um selo ao cliente e abre um ticket de cuidados pós-tattoo.
- Tornar a conta da Eliza administradora (depois de ela entrar uma vez):
  `update public.profiles set role = 'admin' where id = (select id from auth.users where email = '...');`
- Em Supabase → Authentication → URL Configuration, o Site URL e os Redirect URLs têm de apontar para o domínio do site (`https://.../auth/callback`).

## Por fazer

Pagamento do sinal (Stripe), agente automático no chat (precisa das regras de cuidados da Eliza), formulário de feedback para clientes, SMTP próprio para os e-mails de login.

# FideliZap — CRM de Fidelização via WhatsApp

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## Deploy na Vercel

```bash
npm install -g vercel
vercel
```

## Estrutura

```
pages/
  index.js        → Dashboard
  contatos.js     → Contatos
  clientes.js     → Clientes RFM
  campanhas.js    → Campanhas
  integracoes.js  → Integrações

components/
  Layout.js       → Sidebar + Topbar
  GlassCard.js    → Card com efeito glass
```

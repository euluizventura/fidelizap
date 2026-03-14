-- =============================================
-- FideliZap — Schema do banco de dados
-- Cole no SQL Editor do Supabase e clique em Run
-- =============================================

-- CONTATOS
create table if not exists contatos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  telefone text not null unique,
  origem text not null check (origem in ('Google Ads','Meta Ads','Instagram','Orgânico','Base de Clientes')),
  status text not null default 'Prospect' check (status in ('Ativo','Prospect','Novo','VIP')),
  created_at timestamp with time zone default now()
);

-- CLIENTES (contatos que já compraram)
create table if not exists clientes (
  id uuid default gen_random_uuid() primary key,
  contato_id uuid references contatos(id) on delete cascade,
  total_compras integer default 0,
  valor_total numeric(10,2) default 0,
  ultima_compra timestamp with time zone,
  segmento text default 'Promissores' check (segmento in ('Campeões','Fiéis','Promissores','Em risco','Dormentes','Perdidos')),
  recencia integer default 0,
  frequencia integer default 0,
  monetario numeric(10,2) default 0,
  updated_at timestamp with time zone default now()
);

-- CAMPANHAS
create table if not exists campanhas (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  segmento text not null,
  template text not null,
  mensagem text not null,
  data_envio timestamp with time zone not null,
  status text default 'Agendada' check (status in ('Agendada','Enviada','Cancelada')),
  total_enviadas integer default 0,
  total_abertas integer default 0,
  receita_gerada numeric(10,2) default 0,
  created_at timestamp with time zone default now()
);

-- DISPAROS (registro de cada mensagem enviada)
create table if not exists disparos (
  id uuid default gen_random_uuid() primary key,
  campanha_id uuid references campanhas(id) on delete cascade,
  contato_id uuid references contatos(id) on delete cascade,
  status text default 'Pendente' check (status in ('Pendente','Enviado','Lido','Falhou')),
  enviado_em timestamp with time zone,
  lido_em timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- COMPRAS
create table if not exists compras (
  id uuid default gen_random_uuid() primary key,
  contato_id uuid references contatos(id) on delete cascade,
  valor numeric(10,2) not null,
  origem_campanha_id uuid references campanhas(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- =============================================
-- Dados de exemplo para testar
-- =============================================

insert into contatos (nome, telefone, origem, status) values
  ('Ana Silva', '61988001122', 'Base de Clientes', 'Ativo'),
  ('João Melo', '61999013344', 'Google Ads', 'Ativo'),
  ('Carla Braga', '61977329900', 'Meta Ads', 'Prospect'),
  ('Marcos Dias', '61988215566', 'Instagram', 'VIP'),
  ('Paula Ramos', '61999007788', 'Orgânico', 'Novo'),
  ('Ricardo Lima', '61988102233', 'Base de Clientes', 'Ativo'),
  ('Fernanda Costa', '61977234455', 'Google Ads', 'Prospect'),
  ('Bruno Alves', '61999006677', 'Meta Ads', 'Ativo');

-- RFM de exemplo
insert into clientes (contato_id, total_compras, valor_total, ultima_compra, segmento, recencia, frequencia, monetario)
select id, 7, 892.00, now() - interval '6 days', 'Fiéis', 6, 7, 892 from contatos where nome = 'Ana Silva';

insert into clientes (contato_id, total_compras, valor_total, ultima_compra, segmento, recencia, frequencia, monetario)
select id, 12, 2340.00, now() - interval '4 days', 'Campeões', 4, 12, 2340 from contatos where nome = 'Marcos Dias';

insert into clientes (contato_id, total_compras, valor_total, ultima_compra, segmento, recencia, frequencia, monetario)
select id, 4, 430.00, now() - interval '22 days', 'Promissores', 22, 4, 430 from contatos where nome = 'Ricardo Lima';

insert into clientes (contato_id, total_compras, valor_total, ultima_compra, segmento, recencia, frequencia, monetario)
select id, 3, 291.00, now() - interval '45 days', 'Em risco', 45, 3, 291 from contatos where nome = 'Bruno Alves';

-- Campanha de exemplo
insert into campanhas (nome, segmento, template, mensagem, data_envio, status, total_enviadas, total_abertas, receita_gerada) values
  ('Sentimos sua falta!', 'Dormentes', 'reativacao_v1', 'Olá {{nome}}, faz um tempo que não te vemos. Temos um presente especial para você voltar!', now() - interval '11 days', 'Enviada', 148, 107, 3240.00),
  ('Benefício VIP', 'Campeões', 'vip_v1', 'Olá {{nome}}, você é especial para nós! Preparamos um benefício exclusivo.', now() - interval '4 days', 'Enviada', 62, 55, 8120.00),
  ('Promoção vitaminas', 'Fiéis', 'promo_v1', 'Oi {{nome}}! Nossa promoção de vitaminas está imperdível essa semana.', now() + interval '1 day', 'Agendada', 0, 0, 0);

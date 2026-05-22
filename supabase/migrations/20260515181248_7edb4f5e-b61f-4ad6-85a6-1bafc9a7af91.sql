create extension if not exists vector;

create table public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index knowledge_base_embedding_idx
  on public.knowledge_base using hnsw (embedding vector_cosine_ops);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'New chat',
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  sources jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages(conversation_id, created_at);

alter table public.knowledge_base enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Demo: public read/write (replace with auth-scoped policies in prod)
create policy "demo read kb" on public.knowledge_base for select using (true);
create policy "demo read conv" on public.conversations for select using (true);
create policy "demo write conv" on public.conversations for insert with check (true);
create policy "demo read msg" on public.messages for select using (true);
create policy "demo write msg" on public.messages for insert with check (true);

create or replace function public.match_knowledge(
  query_embedding vector(1536),
  match_count int default 4
)
returns table (
  id uuid,
  title text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    k.id,
    k.title,
    k.content,
    1 - (k.embedding <=> query_embedding) as similarity
  from public.knowledge_base k
  where k.embedding is not null
  order by k.embedding <=> query_embedding
  limit match_count;
$$;
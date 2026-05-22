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
language sql
stable
security invoker
set search_path = public
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
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

async function embed(text: string): Promise<number[]> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(`${GATEWAY}/embeddings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: text,
      dimensions: 1536,
    }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding as number[];
}

export const seedKnowledge = createServerFn({ method: "POST" }).handler(async () => {
  const { count } = await supabaseAdmin
    .from("knowledge_base")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) return { seeded: 0, skipped: true };

  const docs = [
    {
      title: "About Nova",
      content:
        "Nova is an AI assistant built for mobile. It's a Progressive Web App (PWA) you can install on your phone without the App Store. Works offline, supports push notifications, and uses semantic search (RAG) to ground its answers.",
    },
    {
      title: "Install on iOS",
      content:
        "iPhone: open Nova in Safari, tap the Share button (square with an upward arrow), then 'Add to Home Screen'. Nova will appear as a standalone app.",
    },
    {
      title: "Install on Android",
      content:
        "Android: open Nova in Chrome. An 'Install app' bar usually appears at the bottom, or open the menu and tap 'Install app' / 'Add to Home screen'. After installing, Nova runs like a native app.",
    },
    {
      title: "Pricing",
      content:
        "Nova Free: 50 messages per day, 5 RAG documents. Pro plan — 9 EUR/month: unlimited messages, 500 documents, priority model (GPT-5). Team plan — 29 EUR/user: shared knowledge base, audit logs, SSO.",
    },
    {
      title: "RAG and knowledge base",
      content:
        "RAG (Retrieval Augmented Generation) means that before answering, Nova searches its knowledge base for semantically similar documents and adds them to the context. Answers are grounded in your data, not just the model's general knowledge. Embeddings are stored in a pgvector database.",
    },
    {
      title: "Privacy",
      content:
        "Conversations are encrypted in transit (TLS 1.3) and stored in the EU region. Your messages are not used for model training. You can delete your full history via Settings → Delete all data. GDPR-compliant.",
    },
  ];

  const rows = await Promise.all(
    docs.map(async (d) => ({
      title: d.title,
      content: d.content,
      embedding: JSON.stringify(await embed(`${d.title}\n${d.content}`)),
    })),
  );

  const { error } = await supabaseAdmin.from("knowledge_base").insert(rows);
  if (error) throw new Error(error.message);
  return { seeded: rows.length, skipped: false };
});

export const createConversation = createServerFn({ method: "POST" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert({ title: "New chat" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id };
});

export const getMessages = createServerFn({ method: "GET" })
  .inputValidator((d: { conversationId: string }) => d)
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("messages")
      .select("id, role, content, sources, created_at")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { messages: rows ?? [] };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        conversationId: z.string().uuid(),
        message: z.string().min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    // 1. Save user message
    await supabaseAdmin.from("messages").insert({
      conversation_id: data.conversationId,
      role: "user",
      content: data.message,
    });

    // 2. RAG: embed query, retrieve top docs
    const queryEmbedding = await embed(data.message);
    const { data: matches } = await supabaseAdmin.rpc("match_knowledge", {
      query_embedding: JSON.stringify(queryEmbedding) as unknown as string,
      match_count: 3,
    });

    const sources = (matches ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      similarity: Number(m.similarity.toFixed(3)),
    }));

    const context = (matches ?? [])
      .map((m, i) => `[${i + 1}] ${m.title}\n${m.content}`)
      .join("\n\n");

    // 3. Load recent history
    const { data: history } = await supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const systemPrompt = `You are Nova — a friendly, concise AI assistant for a mobile app. Reply in English, keep it short (1-3 sentences when possible).

Use the following context from the knowledge base when answering. If the context doesn't contain the answer, honestly say you don't know.

KONTEKSTAS:
${context || "(knowledge base is empty)"}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    ];

    const aiRes = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      if (aiRes.status === 429) throw new Error("Rate limit. Bandyk po minutės.");
      if (aiRes.status === 402) throw new Error("AI kreditai išsekę.");
      throw new Error(`AI error: ${aiRes.status} ${txt}`);
    }

    const json = await aiRes.json();
    const reply = json.choices?.[0]?.message?.content ?? "Sorry, I don't have an answer.";

    // 4. Save assistant message
    const { data: saved } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: data.conversationId,
        role: "assistant",
        content: reply,
        sources,
      })
      .select()
      .single();

    return {
      id: saved?.id,
      content: reply,
      sources,
    };
  });

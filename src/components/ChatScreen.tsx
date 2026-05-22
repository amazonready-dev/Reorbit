import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Sparkles, BookOpen } from "lucide-react";
import {
  createConversation,
  getMessages,
  sendMessage,
  seedKnowledge,
} from "@/lib/chat.functions";

interface Source {
  id: string;
  title: string;
  similarity: number;
}

interface Message {
  id: string;
  role: string;
  content: string;
  sources?: Source[] | null;
}

const SUGGESTIONS = [
  "How do I install Nova on iPhone?",
  "What is RAG?",
  "How much does the Pro plan cost?",
  "Is my data safe?",
];

export function ChatScreen() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createConv = useServerFn(createConversation);
  const getMsgs = useServerFn(getMessages);
  const send = useServerFn(sendMessage);
  const seed = useServerFn(seedKnowledge);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await seed({});
        const { id } = await createConv({});
        if (cancelled) return;
        setConversationId(id);
        const { messages: msgs } = await getMsgs({ data: { conversationId: id } });
        if (!cancelled) setMessages(msgs as Message[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Initialization failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [createConv, getMsgs, seed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const submit = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || !conversationId || sending) return;
      setError(null);
      setInput("");
      const optimistic: Message = {
        id: `tmp-${Date.now()}`,
        role: "user",
        content: value,
      };
      setMessages((m) => [...m, optimistic]);
      setSending(true);
      try {
        const reply = await send({ data: { conversationId, message: value } });
        setMessages((m) => [
          ...m,
          {
            id: reply.id ?? `r-${Date.now()}`,
            role: "assistant",
            content: reply.content,
            sources: reply.sources,
          },
        ]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send");
      } finally {
        setSending(false);
      }
    },
    [conversationId, send, sending],
  );

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="pt-safe border-b border-border bg-surface/80 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold leading-tight text-foreground">Nova</h1>
            <p className="text-xs text-muted-foreground">AI assistant · RAG</p>
          </div>
          <div className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-accent">
            Demo
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !error && (
          <EmptyState onPick={(s) => submit(s)} ready={!!conversationId} />
        )}

        <div className="space-y-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {sending && <TypingBubble />}
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="pb-safe border-t border-border bg-surface/80 backdrop-blur"
      >
        <div className="flex items-end gap-2 px-3 py-3">
          <div className="flex-1 rounded-2xl border border-border bg-input px-4 py-2.5 focus-within:border-primary focus-within:shadow-glow transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder={conversationId ? "Ask Nova..." : "Loading..."}
              disabled={!conversationId || sending}
              rows={1}
              className="w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || !conversationId || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            aria-label="Send"
          >
            <Send className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "" : "space-y-2"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-bubble ${
            isUser
              ? "bg-gradient-bubble text-primary-foreground rounded-br-sm"
              : "bg-surface-elevated text-foreground rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.sources.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                <BookOpen className="h-2.5 w-2.5" />
                <span className="text-foreground">{s.title}</span>
                <span className="text-accent">{Math.round(s.similarity * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm bg-surface-elevated px-4 py-3 shadow-bubble">
        <div className="flex items-center gap-1">
          <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
          <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onPick,
  ready,
}: {
  onPick: (s: string) => void;
  ready: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center pt-12 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-brand shadow-glow">
        <Sparkles className="h-10 w-10 text-primary-foreground" strokeWidth={2} />
      </div>
      <h2 className="mb-1 text-2xl font-bold tracking-tight">
        Hi, I'm <span className="text-gradient-brand">Nova</span>
      </h2>
      <p className="mb-8 max-w-xs text-sm text-muted-foreground">
        An AI assistant with RAG — answers grounded in a knowledge base, not guesses.
      </p>
      <div className="grid w-full max-w-sm gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            disabled={!ready}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-foreground transition-all hover:border-primary hover:shadow-glow active:scale-[0.98] disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const QUICK_PROMPTS = [
  "Trim the first 5 seconds",
  "Make it vertical 9:16",
  "Add captions",
  "Remove silence between 10s and 12s",
];

export default function ChatPanel({ messages, editPlan, onSend, chatting, transcriptReady }) {
  const [input, setInput] = useState("");
  const [showJson, setShowJson] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, chatting]);

  const submit = (e) => {
    e?.preventDefault?.();
    if (!input.trim() || chatting) return;
    onSend(input);
    setInput("");
  };

  return (
    <aside className="w-[320px] lg:w-[380px] border-l border-line bg-obsidian flex flex-col min-h-0 shrink-0" data-testid="chat-panel">
      <div className="h-10 px-3 flex items-center justify-between border-b border-line">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-warningYellow" />
          <span className="uppercase-label">AI Editor</span>
        </div>
        <span className="mono text-[10px] text-zinc-500">claude-sonnet-4.5</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="text-zinc-500 text-sm">
            <p className="mb-3">Tell me how you want to edit this video.</p>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  data-testid={`quick-prompt-${q.slice(0, 10).replace(/\s/g, '-')}`}
                  disabled={!transcriptReady || chatting}
                  onClick={() => onSend(q)}
                  className="w-full text-left text-xs px-2.5 py-2 border border-line bg-surface/60 hover:bg-surface hover:border-warningYellow transition-colors disabled:opacity-40"
                >
                  <span className="mono text-warningYellow">›</span> {q}
                </button>
              ))}
            </div>
            {!transcriptReady && (
              <p className="mt-3 text-[11px] text-zinc-600 mono">Waiting for transcript before chatting…</p>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={m.id || i}
            data-testid={`chat-message-${m.role}-${i}`}
            className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-6 h-6 shrink-0 flex items-center justify-center ${m.role === "user" ? "bg-surface border border-line" : "bg-warningYellow text-black"}`}>
              {m.role === "user" ? <User size={11} /> : <Bot size={11} />}
            </div>
            <div
              className={`max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-surfaceHover px-3 py-2"
                  : "border-l-2 border-warningYellow pl-3 py-1 text-zinc-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {chatting && (
          <div className="flex gap-2">
            <div className="w-6 h-6 shrink-0 bg-warningYellow text-black flex items-center justify-center animate-pulseRing">
              <Bot size={11} />
            </div>
            <div className="border-l-2 border-warningYellow pl-3 py-1 text-zinc-400 text-sm flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" />
              <span className="shimmer-text">Generating edit plan…</span>
            </div>
          </div>
        )}
      </div>

      {/* JSON viewer */}
      <div className="border-t border-line">
        <button
          data-testid="toggle-json-button"
          onClick={() => setShowJson((s) => !s)}
          className="w-full px-3 h-8 flex items-center justify-between hover:bg-surface transition-colors"
        >
          <span className="uppercase-label">Edit Plan JSON</span>
          {showJson ? <ChevronDown size={13} className="text-zinc-500" /> : <ChevronUp size={13} className="text-zinc-500" />}
        </button>
        {showJson && (
          <pre
            data-testid="edit-plan-json"
            className="mono text-[10.5px] text-zinc-300 bg-obsidian px-3 py-2 max-h-48 overflow-auto border-t border-line whitespace-pre"
          >
            {JSON.stringify(editPlan || {}, null, 2)}
          </pre>
        )}
      </div>

      {/* Input */}
      <form onSubmit={submit} className="border-t border-line p-2 flex items-end gap-2 shrink-0">
        <textarea
          data-testid="chat-input"
          rows={1}
          value={input}
          disabled={chatting || !transcriptReady}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder={transcriptReady ? "Tell the AI what to edit…" : "Waiting for transcript…"}
          className="flex-1 bg-surface border border-line px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-warningYellow resize-none max-h-32"
        />
        <button
          type="submit"
          data-testid="chat-send-button"
          disabled={chatting || !input.trim() || !transcriptReady}
          className="w-9 h-9 bg-warningYellow text-black flex items-center justify-center hover:brightness-95 disabled:opacity-40 transition"
        >
          {chatting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
    </aside>
  );
}

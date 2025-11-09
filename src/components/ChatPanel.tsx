import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { askEva, type ProjectId } from "../lib/evaClient";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

interface Props {
  projectId: ProjectId;
}

export function ChatPanel({ projectId }: Props) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  const taglineKey = `tagline.${projectId}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: counter,
      role: "user",
      text: trimmed
    };
    setCounter((c) => c + 1);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askEva({ projectId, message: trimmed });
      const assistantMsg: Message = {
        id: counter + 1,
        role: "assistant",
        text: res.answer
      };
      setCounter((c) => c + 2);
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-label="Chat panel">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold mb-1">
          {t(taglineKey)}
        </h1>
        <p className="text-sm text-gray-600">
          DEMO · Project-aware chat powered by EVA (mocked).
        </p>
      </header>

      <div
        role="log"
        aria-live="polite"
        className="mb-4 max-h-[50vh] overflow-y-auto rounded border border-gray-200 bg-[var(--color-surface)] p-3 space-y-3"
      >
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">
            Start a conversation by asking a question below.
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t("input.label")}
          <textarea
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("input.placeholder")}
          />
        </label>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded px-4 py-2 text-sm text-white disabled:opacity-60"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            {loading && (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {t("button.send")}
          </button>
        </div>
      </form>
    </section>
  );
}

export interface ConversationMemoryMessage {
  role: "user" | "assistant";
  content: string;
}

const defaultLimit = 6;
const maxMessageLength = 500;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function trimMessageContent(value: string) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";
  if (normalized.length <= maxMessageLength) return normalized;
  return `${normalized.slice(0, maxMessageLength - 3).trimEnd()}...`;
}

function isConversationRole(value: unknown): value is ConversationMemoryMessage["role"] {
  return value === "user" || value === "assistant";
}

export function buildConversationMemory(
  history: unknown,
  limit = defaultLimit
): ConversationMemoryMessage[] {
  if (!Array.isArray(history)) return [];

  const sanitizedLimit = Math.max(1, Math.min(limit, defaultLimit));

  return history
    .filter((item): item is { role?: unknown; content?: unknown } => Boolean(item) && typeof item === "object")
    .map((item) => {
      const role = isConversationRole(item.role) ? item.role : null;
      const content = typeof item.content === "string" ? trimMessageContent(item.content) : "";

      if (!role || !content) return null;

      return { role, content };
    })
    .filter((item): item is ConversationMemoryMessage => Boolean(item))
    .slice(-sanitizedLimit);
}

export function formatConversationMemory(messages: ConversationMemoryMessage[]): string {
  if (!messages.length) return "";

  return ["CONVERSATION MEMORY:", ...messages.map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)].join(
    "\n"
  );
}

// lib/ai-chat.ts

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  didYouMean?: string[];
};

export type AIResponse = {
  reply: string;
  suggestions: string[];
  didYouMean: string[] | null;
};

export async function sendMessage(message: string): Promise<AIMessage> {
  try {
    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data: AIResponse = await res.json();

    if (!data?.reply) {
      return {
        role: "assistant",
        content: "AI sedang tidak tersedia, silakan hubungi via contact.",
      };
    }

    return {
      role: "assistant",
      content: data.reply,
      suggestions: data.suggestions,
      didYouMean: data.didYouMean ?? undefined,
    };
  } catch (error) {
    console.error("AI fetch failed:", error);

    return {
      role: "assistant",
      content: "AI sedang tidak tersedia, silakan hubungi via contact.",
    };
  }
}

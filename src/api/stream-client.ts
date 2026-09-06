import { API_BASE_URL } from "@/config/env";

export const streamChat = async (
  chatSessionId: string,
  question: string,
  onChunk: (chunk: string) => void,
) => {
  console.log(`learnerQuestion:${question}`);
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_session_id: chatSessionId,
      learner_question: question,
    }),
    credentials: "include",
  });

  if (!response.ok) throw new Error("Streaming failed");

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunkValue = decoder.decode(value);
    onChunk(chunkValue);
  }
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string; message?: string })?.error || (data as { message?: string })?.message || "AI API error");
  }
  return data as T;
}

export const aiService = {
  async text(prompt: string) {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/ai/text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ prompt }),
    });
    return parseResponse<{ response: string }>(res);
  },

  async sentiment(text: string) {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/ai/sentiment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text }),
    });
    return parseResponse<{ response: string }>(res);
  },

  async vision(file: File, prompt?: string) {
    const token = getToken();
    const body = new FormData();
    body.append("image", file);
    if (prompt) body.append("prompt", prompt);

    const res = await fetch(`${API_URL}/api/ai/vision`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    });
    return parseResponse<{ response: string }>(res);
  },
};

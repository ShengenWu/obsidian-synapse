import type { LLMProvider } from "./LLMProvider";
import { requestUrl, type RequestUrlParam } from "obsidian";

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;

  constructor(apiKey: string, baseUrl: string, modelName: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.modelName = modelName;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenAI API Key not configured.");
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    // Sanitize Base URL
    const baseUrl = this.baseUrl.replace(/\/$/, "");
    const url = `${baseUrl}/chat/completions`;

    const body: any = {
      model: this.modelName,
      messages: messages,
      temperature: 0.7
    };

    // O-series models (e.g. o1-preview, o1-mini, o4-mini) use 'max_completion_tokens'
    // Heuristic: check if model name starts with 'o' followed by a digit. This covers o1, o3, o4.
    if (this.modelName.match(/^o\d/)) {
      body.max_completion_tokens = 1000;
    } else {
      body.max_tokens = 1000;
    }

    console.log("[Synapse] Sending LLM Request:", {
      url,
      model: this.modelName,
      messagesCount: messages.length
    });

    const request: RequestUrlParam = {
      url: url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body),
      throw: false
    };

    try {
      const response = await requestUrl(request);

      if (response.status >= 400) {
        console.error("[Synapse] API Error Body:", response.text);
        try {
          const errorJson = response.json;
          console.error("[Synapse] API Error JSON:", errorJson);
          const msg = errorJson?.error?.message || response.text;
          throw new Error(`API Error ${response.status}: ${msg}`);
        } catch (jsonError) {
          throw new Error(`API Error ${response.status}: ${response.text}`);
        }
      }

      const data = response.json;
      return data.choices[0].message.content;
    } catch (e) {
      console.error("[Synapse] Request Failed:", e);
      throw e;
    }
  }

  async *stream(prompt: string, systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    if (!this.apiKey) {
      throw new Error("OpenAI API Key not configured.");
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const baseUrl = this.baseUrl.replace(/\/$/, "");
    const url = `${baseUrl}/chat/completions`;

    const body: any = {
      model: this.modelName,
      messages: messages,
      temperature: 0.7,
      stream: true
    };

    if (this.modelName.match(/^o\d/)) {
      body.max_completion_tokens = 1000;
    } else {
      body.max_tokens = 1000;
    }

    // Use native fetch for streaming
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      let msg = text;
      try {
        const json = JSON.parse(text);
        msg = json.error?.message || text;
      } catch (e) { }
      throw new Error(`API Error ${response.status}: ${msg}`);
    }

    if (!response.body) {
      throw new Error("No response body received for streaming.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") return;

        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content || "";
          if (content) {
            yield content;
          }
        } catch (e) {
          console.warn("[Synapse] Stream parse error", e);
        }
      }
    }
  }
}

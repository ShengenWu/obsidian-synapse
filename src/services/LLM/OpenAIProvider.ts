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
    // Obsidian requestUrl doesn't support streaming easily, 
    // for MVP we will use fetch but this might have CORS issues if not handled by Obsidian's requestUrl
    // However, for standard OpenAI API, requestUrl is safer for CORS.
    // Implementing proper streaming in Obsidian plugins usually requires using the native fetch with some tweaks 
    // or a library like eventsource-parser. 
    // For phase 1 MVP, let's stick to non-streaming or simulate it, 
    // or implement a basic fetch-based stream if possible.

    // Simulating streaming for now by just yielding the full response to keep MVP simple 
    // and avoid complex fetch/Polyfill setup in this step.
    // We will upgrade this to real streaming later.

    const text = await this.generate(prompt, systemPrompt);
    // Simulate chunks
    const chunkSize = 10;
    for (let i = 0; i < text.length; i += chunkSize) {
      yield text.slice(i, i + chunkSize);
      await new Promise(r => setTimeout(r, 10)); // tiny delay
    }
  }
}

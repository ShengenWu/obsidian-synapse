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

    const request: RequestUrlParam = {
      url: `${this.baseUrl}/chat/completions`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    };

    const response = await requestUrl(request);

    if (response.status !== 200) {
      throw new Error(`OpenAI API Error: ${response.status} - ${response.text}`);
    }

    const data = response.json;
    return data.choices[0].message.content;
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

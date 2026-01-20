export interface LLMProvider {
  generate(prompt: string, systemPrompt?: string): Promise<string>;
  stream(prompt: string, systemPrompt?: string): AsyncGenerator<string, void, unknown>;
}

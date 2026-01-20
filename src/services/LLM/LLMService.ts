import { singleton } from "tsyringe";
import { SettingsManager, type SynapseSettings } from "../SettingsManager";
import { ServiceContainer } from "../../core/ServiceContainer";
import type { LLMProvider } from "./LLMProvider";
import { OpenAIProvider } from "./OpenAIProvider";

@singleton()
export class LLMService {
  private provider!: LLMProvider;
  private settingsManager: SettingsManager;

  constructor() {
    this.settingsManager = ServiceContainer.getInstance().resolve(SettingsManager);
    this.initializeProvider();
  }

  public initializeProvider() {
    const config = this.settingsManager.getActiveProviderConfig();

    if (!config) {
      console.warn("No active provider configured.");
      // We might want to set a dummy provider or throw when generating?
      // For now, let's just return and let generate throw if provider is undefined.
      return;
    }

    // Currently only supporting OpenAI, factory logic can expand later
    this.provider = new OpenAIProvider(
      config.apiKey,
      config.baseUrl,
      config.defaultModelId
    );
  }

  public async generate(prompt: string, systemPrompt?: string): Promise<string> {
    // Re-init provider in case settings changed (e.g. key)
    this.initializeProvider();
    return this.provider.generate(prompt, systemPrompt);
  }

  public async *stream(prompt: string, systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    this.initializeProvider();
    for await (const chunk of this.provider.stream(prompt, systemPrompt)) {
      yield chunk;
    }
  }
}

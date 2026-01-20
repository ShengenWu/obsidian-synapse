import { Plugin } from "obsidian";
import { singleton } from "tsyringe";
import { z } from "zod";

export const LLMProviderConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["openai", "anthropic", "custom"]).default("openai"),
  apiKey: z.string().default(""),
  baseUrl: z.string().default("https://api.openai.com/v1"),
  models: z.array(z.string()).default(["gpt-3.5-turbo", "gpt-4", "gpt-4o"]),
  defaultModelId: z.string().default("gpt-3.5-turbo"),
});

export type LLMProviderConfig = z.infer<typeof LLMProviderConfigSchema>;

export const SynapseSettingsSchema = z.object({
  providers: z.array(LLMProviderConfigSchema),
  activeProviderId: z.string(),
});

export type SynapseSettings = z.infer<typeof SynapseSettingsSchema>;

const DEFAULT_PROVIDER_ID = "default-openai";

export const DEFAULT_SETTINGS: SynapseSettings = {
  providers: [
    {
      id: DEFAULT_PROVIDER_ID,
      name: "Default OpenAI",
      type: "openai",
      apiKey: "",
      baseUrl: "https://api.openai.com/v1",
      models: ["gpt-3.5-turbo", "gpt-4", "gpt-4o", "gpt-4o-mini"],
      defaultModelId: "gpt-3.5-turbo"
    }
  ],
  activeProviderId: DEFAULT_PROVIDER_ID
};

@singleton()
export class SettingsManager {
  private plugin: Plugin;
  private settings: SynapseSettings;

  constructor() { }

  public async initialize(plugin: Plugin): Promise<void> {
    this.plugin = plugin;
    await this.loadSettings();
  }

  private async loadSettings(): Promise<void> {
    const data = await this.plugin.loadData();

    // Handle migration from old format if needed (simple check)
    if (data && data.openAIApiKey !== undefined && !data.providers) {
      const migratedSettings: SynapseSettings = {
        providers: [
          {
            id: DEFAULT_PROVIDER_ID,
            name: "Default OpenAI",
            type: "openai",
            apiKey: data.openAIApiKey || "",
            baseUrl: data.openAIBaseUrl || "https://api.openai.com/v1",
            models: [data.modelName || "gpt-3.5-turbo", "gpt-4", "gpt-4o"],
            defaultModelId: data.modelName || "gpt-3.5-turbo"
          }
        ],
        activeProviderId: DEFAULT_PROVIDER_ID
      };
      this.settings = migratedSettings;
      await this.saveSettings(); // Save migration immediately
      return;
    }

    const result = SynapseSettingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...data });

    if (result.success) {
      this.settings = result.data;
    } else {
      console.error("Failed to load settings:", result.error);
      this.settings = DEFAULT_SETTINGS;
    }
  }

  public async saveSettings(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }

  public getSettings(): SynapseSettings {
    return this.settings;
  }

  public updateSettings(partial: Partial<SynapseSettings>): void {
    this.settings = { ...this.settings, ...partial };
    // Don't auto-save always if we want an "Apply" button? 
    // User requested "Apply" button to know it's effective.
    // But for persistence we should save.
    // "Apply" in UI usually means "Make these settings active for the running services".
    this.saveSettings();
  }

  public getActiveProviderConfig(): LLMProviderConfig | undefined {
    return this.settings.providers.find(p => p.id === this.settings.activeProviderId);
  }
}

import { Plugin } from "obsidian";
import { singleton } from "tsyringe";
import { z } from "zod";

export const SynapseSettingsSchema = z.object({
  openAIApiKey: z.string().default(""),
  openAIBaseUrl: z.string().default("https://api.openai.com/v1"),
  modelName: z.string().default("gpt-3.5-turbo"),
});

export type SynapseSettings = z.infer<typeof SynapseSettingsSchema>;

export const DEFAULT_SETTINGS: SynapseSettings = SynapseSettingsSchema.parse({});

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
    // Merge default settings with loaded data
    // We use safeParse to handle potential schema changes gracefully in the future
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
    this.saveSettings();
  }
}

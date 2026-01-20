import { App, PluginSettingTab, Setting, ButtonComponent, Notice } from "obsidian";
import SynapsePlugin from "../main";
import { ServiceContainer } from "../core/ServiceContainer";
import { SettingsManager, type LLMProviderConfig } from "../services/SettingsManager";
import { LLMService } from "../services/LLM/LLMService";
import { ProfileEditModal } from "./ProfileEditModal";

export class SynapseSettingTab extends PluginSettingTab {
  plugin: SynapsePlugin;
  private settingsManager: SettingsManager;
  private llmService: LLMService;

  constructor(app: App, plugin: SynapsePlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.settingsManager = ServiceContainer.getInstance().resolve(SettingsManager);
    this.llmService = ServiceContainer.getInstance().resolve(LLMService);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("synapse-settings");

    containerEl.createEl("h2", { text: "Synapse Intelligence" });

    const settings = this.settingsManager.getSettings();

    // --- Active Provider Selection ---
    new Setting(containerEl)
      .setName("Active Provider")
      .setDesc("Select which AI profile to use.")
      .addDropdown((dropdown) => {
        settings.providers.forEach((p) => {
          dropdown.addOption(p.id, p.name);
        });
        dropdown.setValue(settings.activeProviderId);
        dropdown.onChange(async (value) => {
          this.settingsManager.updateSettings({ activeProviderId: value });
          this.display(); // Refresh to update Active Model list if we were to show it here
        });
      });

    // --- Active Model Selection (Quick Switch) ---
    const activeConfig = this.settingsManager.getActiveProviderConfig();
    if (activeConfig) {
      new Setting(containerEl)
        .setName("Active Model")
        .setDesc(`Select default model for ${activeConfig.name}`)
        .addDropdown((dropdown) => {
          activeConfig.models.forEach(m => dropdown.addOption(m, m));
          dropdown.setValue(activeConfig.defaultModelId || activeConfig.models[0] || "");
          dropdown.onChange(async (value) => {
            // We need to update the defaultModelId for the active provider
            const providerIndex = settings.providers.findIndex(p => p.id === activeConfig.id);
            if (providerIndex !== -1) {
              settings.providers[providerIndex].defaultModelId = value;
              await this.settingsManager.updateSettings({ providers: settings.providers });
            }
          });
        });
    }

    containerEl.createEl("h3", { text: "Profiles" });
    const profilesContainer = containerEl.createDiv({ cls: "synapse-profiles-list" });

    // --- Profiles List ---
    settings.providers.forEach((provider, index) => {
      const isDefault = provider.id === settings.activeProviderId;
      const card = profilesContainer.createDiv({ cls: "synapse-profile-card" });
      if (isDefault) card.addClass("active-profile");

      const header = card.createDiv({ cls: "synapse-card-header" });
      header.createSpan({ text: provider.name, cls: "profile-name" });
      if (isDefault) header.createSpan({ text: "Active", cls: "profile-badge" });

      const btnGroup = card.createDiv({ cls: "synapse-card-buttons" });
      new ButtonComponent(btnGroup)
        .setButtonText("Edit")
        .onClick(() => {
          new ProfileEditModal(this.app, provider, async (newConfig) => {
            settings.providers[index] = newConfig;
            await this.settingsManager.updateSettings({ providers: settings.providers });
            this.display();
          }).open();
        });

      new ButtonComponent(btnGroup)
        .setIcon("trash")
        .setTooltip("Delete")
        .onClick(async () => {
          if (settings.providers.length <= 1) {
            new Notice("Cannot delete the last provider.");
            return;
          }
          const newProviders = settings.providers.filter(p => p.id !== provider.id);
          let newActiveId = settings.activeProviderId;
          if (settings.activeProviderId === provider.id) {
            newActiveId = newProviders[0].id; // Fallback
          }
          await this.settingsManager.updateSettings({ providers: newProviders, activeProviderId: newActiveId });
          this.display();
        });
    });

    // --- Add New Provider ---
    new Setting(containerEl)
      .addButton(btn => {
        btn.setButtonText("Create New Profile");
        btn.buttonEl.addClass("synapse-add-btn"); // Fix: Use buttonEl
        btn.onClick(async () => {
          const newId = `provider-${Date.now()}`;
          const newProvider: LLMProviderConfig = {
            id: newId,
            name: "New Profile",
            type: "openai",
            apiKey: "",
            baseUrl: "https://api.openai.com/v1",
            models: ["gpt-3.5-turbo"],
            defaultModelId: "gpt-3.5-turbo"
          };
          const newProviders = [...settings.providers, newProvider];
          await this.settingsManager.updateSettings({ providers: newProviders });
          this.display();

          // Immediately open edit modal for the new one?
          // new ProfileEditModal(this.app, newProvider, ...).open();
        });
      });

    // --- Apply / Reconnect ---
    containerEl.createEl("hr");
    new Setting(containerEl)
      .setName("Apply Changes")
      .setDesc("Restart AI Service with current configuration")
      .addButton(btn => btn
        .setButtonText("Apply & Reload")
        .setCta()
        .onClick(async () => {
          await this.settingsManager.saveSettings();
          this.llmService.initializeProvider();
          new Notice("Synapse: Settings Applied & Reconnected");
        })
      );
  }
}

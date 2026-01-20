import { App, Modal, Setting, Notice, ButtonComponent } from "obsidian";
import { type LLMProviderConfig } from "../services/SettingsManager";

export class ProfileEditModal extends Modal {
  private config: LLMProviderConfig;
  private onSave: (newConfig: LLMProviderConfig) => void;

  constructor(app: App, config: LLMProviderConfig, onSave: (newConfig: LLMProviderConfig) => void) {
    super(app);
    this.config = { ...config }; // Clone to avoid direct mutation/reference issues until save
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass("synapse-profile-modal");

    contentEl.createEl("h2", { text: `Edit Profile: ${this.config.name}` });

    // --- Basic Info ---
    new Setting(contentEl)
      .setName("Profile Name")
      .addText(text => text
        .setValue(this.config.name)
        .onChange(val => this.config.name = val));

    new Setting(contentEl)
      .setName("API Key")
      .setDesc("The secret key for the API.")
      .addText(text => text
        .setPlaceholder("sk-...")
        .setValue(this.config.apiKey)
        .onChange(val => this.config.apiKey = val));

    new Setting(contentEl)
      .setName("Base URL")
      .setDesc("API endpoint base URL.")
      .addText(text => text
        .setPlaceholder("https://api.openai.com/v1")
        .setValue(this.config.baseUrl)
        .onChange(val => this.config.baseUrl = val));

    // --- Model Management ---
    contentEl.createEl("h3", { text: "Models" });
    const modelsContainer = contentEl.createDiv({ cls: "synapse-model-list" });

    this.renderModelList(modelsContainer);

    // --- Add Model Input ---
    const addModelDiv = contentEl.createDiv({ cls: "synapse-add-model-row" });
    let newModelTemp = "";
    new Setting(addModelDiv)
      .setName("Add Model")
      .setDesc("Type model ID (e.g. gpt-4-turbo) and click +")
      .addText(text => text
        .setPlaceholder("Model ID")
        .onChange(val => newModelTemp = val)
      )
      .addButton(btn => btn
        .setButtonText("+")
        .onClick(() => {
          if (newModelTemp && !this.config.models.includes(newModelTemp)) {
            this.config.models.push(newModelTemp.trim());
            this.renderModelList(modelsContainer);
          }
        })
      );

    // --- Actions ---
    const actionDiv = contentEl.createDiv({ cls: "synapse-modal-actions" });
    new ButtonComponent(actionDiv)
      .setButtonText("Cancel")
      .onClick(() => this.close());

    new ButtonComponent(actionDiv)
      .setButtonText("Save Profile")
      .setCta()
      .onClick(() => {
        this.onSave(this.config);
        this.close();
      });
  }

  private renderModelList(container: HTMLElement) {
    container.empty();

    if (this.config.models.length === 0) {
      container.createEl("div", { text: "No models added yet.", cls: "synapse-empty-state" });
      return;
    }

    this.config.models.forEach(model => {
      const row = container.createDiv({ cls: "synapse-model-row" });

      // Radio for default
      const isDefault = model === this.config.defaultModelId;
      const radio = row.createEl("input", { type: "radio", attr: { name: "default-model" } });
      if (isDefault) radio.checked = true;
      radio.onclick = () => {
        this.config.defaultModelId = model;
        // Re-render to update visuals if needed, or just let state update
      };

      row.createSpan({ text: model, cls: "synapse-model-name" });

      // Delete button
      const delBtn = row.createEl("button", { text: "x", cls: "synapse-mini-btn" });
      delBtn.onclick = () => {
        this.config.models = this.config.models.filter(m => m !== model);
        if (this.config.defaultModelId === model && this.config.models.length > 0) {
          this.config.defaultModelId = this.config.models[0];
        }
        this.renderModelList(container);
      };
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

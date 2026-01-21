import "reflect-metadata";
import { Plugin } from "obsidian";
import { ServiceContainer } from "./core/ServiceContainer";
import { LoggerService } from "./services/LoggerService";
import { SettingsManager, DEFAULT_SETTINGS, SynapseSettings } from "./services/SettingsManager";
import { EventBus } from "./core/EventBus";
import { OmniBarManager } from "./ui/OmniBar/OmniBarManager";
import { BubbleManager } from "./ui/FloatingBubble/BubbleManager";
import { LLMService } from "./services/LLM/LLMService";
import { HistoryService } from "./services/HistoryService";
import { SynapseSettingTab } from "./ui/SynapseSettingTab";

export default class SynapsePlugin extends Plugin {
  private container: ServiceContainer;

  async onload() {
    this.container = ServiceContainer.getInstance();

    // Register Core Services
    this.container.registerSingleton(LoggerService, LoggerService);
    this.container.registerSingleton(EventBus, EventBus);
    this.container.registerSingleton(EventBus, EventBus);
    this.container.registerSingleton(SettingsManager, SettingsManager);
    this.container.registerSingleton(BubbleManager, BubbleManager);
    this.container.registerSingleton(OmniBarManager, OmniBarManager);
    this.container.registerSingleton(LLMService, LLMService);
    this.container.registerSingleton(HistoryService, HistoryService);

    // Resolve Services
    const logger = this.container.resolve(LoggerService);
    const settingsManager = this.container.resolve(SettingsManager);
    const bubbleManager = this.container.resolve(BubbleManager);
    const omniBarManager = this.container.resolve(OmniBarManager);
    const historyService = this.container.resolve(HistoryService);

    logger.info("Loading Synapse Plugin...");

    // Initialize Settings
    await settingsManager.initialize(this);

    // Initialize History
    await historyService.initialize(this);

    // Initialize Bubble Manager
    bubbleManager.initialize(this);

    // Initialize OmniBar Manager
    omniBarManager.initialize(this);

    // Initialize Settings Tab
    this.addSettingTab(new SynapseSettingTab(this.app, this));

    // Add Ribbon Icon (Optional)
    this.addRibbonIcon('brain-circuit', 'Synapse', (evt: MouseEvent) => {
      omniBarManager.toggle();
    });

    // Add Command
    this.addCommand({
      id: 'open-synapse-omnibar',
      name: 'Open Synapse Omni-Bar',
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: " " }],
      callback: () => {
        omniBarManager.toggle();
      }
    });

    logger.info("Synapse Plugin Loaded.");
  }

  async onunload() {
    const logger = this.container.resolve(LoggerService);
    const bubbleManager = this.container.resolve(BubbleManager);
    const omniBarManager = this.container.resolve(OmniBarManager);

    bubbleManager.destroy();
    omniBarManager.destroy();

    logger.info("Unloading Synapse Plugin...");
  }
}

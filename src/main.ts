import "reflect-metadata";
import { Plugin } from "obsidian";
import { ServiceContainer } from "./core/ServiceContainer";
import { LoggerService } from "./services/LoggerService";
import { SettingsManager, DEFAULT_SETTINGS, SynapseSettings } from "./services/SettingsManager";
import { EventBus } from "./core/EventBus";
import { OmniBarModal } from "./ui/OmniBar/OmniBarModal";

export default class SynapsePlugin extends Plugin {
  private container: ServiceContainer;

  async onload() {
    this.container = ServiceContainer.getInstance();

    // Register Core Services
    this.container.registerSingleton(LoggerService, LoggerService);
    this.container.registerSingleton(EventBus, EventBus);
    this.container.registerSingleton(SettingsManager, SettingsManager);

    // Resolve Services
    const logger = this.container.resolve(LoggerService);
    const settingsManager = this.container.resolve(SettingsManager);

    logger.info("Loading Synapse Plugin...");

    // Initialize Settings
    await settingsManager.initialize(this);

    // Add Ribbon Icon (Optional)
    this.addRibbonIcon('brain-circuit', 'Synapse', (evt: MouseEvent) => {
      new OmniBarModal(this.app).open();
    });

    // Add Command
    this.addCommand({
      id: 'open-synapse-omnibar',
      name: 'Open Synapse Omni-Bar',
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: " " }],
      callback: () => {
        new OmniBarModal(this.app).open();
      }
    });

    logger.info("Synapse Plugin Loaded.");
  }

  async onunload() {
    const logger = this.container.resolve(LoggerService);
    logger.info("Unloading Synapse Plugin...");
  }
}

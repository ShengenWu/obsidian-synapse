import { App, Plugin } from "obsidian";
import { singleton } from "tsyringe";
import OmniBarContainer from "./OmniBarContainer.svelte";
import { ServiceContainer } from "../../core/ServiceContainer";
import { LoggerService } from "../../services/LoggerService";

@singleton()
export class OmniBarManager {
  private app!: App;
  private plugin!: Plugin;
  private component: OmniBarContainer | null = null;
  private containerEl!: HTMLElement;
  private logger: LoggerService;
  private isVisible = false;

  constructor() {
    this.logger = ServiceContainer.getInstance().resolve(LoggerService);
  }

  public initialize(plugin: Plugin) {
    this.plugin = plugin;
    this.app = plugin.app;

    // Create a root element attached to body, similar to the bubble but maybe centered or user-positionable later
    this.containerEl = document.createElement("div");
    this.containerEl.addClass("synapse-omnibar-root");
    document.body.appendChild(this.containerEl);

    // Mount Svelte component
    this.component = new OmniBarContainer({
      target: this.containerEl,
      props: {
        visible: false
      }
    });

    // Handle close event from component
    this.component.$on("close", () => {
      this.hide();
    });
  }

  public toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public show() {
    if (this.component) {
      this.isVisible = true;
      this.component.$set({ visible: true });
      // Focus handling might be needed here to focus input
    }
  }

  public hide() {
    if (this.component) {
      this.isVisible = false;
      this.component.$set({ visible: false });
    }
  }

  public destroy() {
    if (this.component) {
      this.component.$destroy();
    }
    if (this.containerEl) {
      this.containerEl.remove();
    }
  }
}

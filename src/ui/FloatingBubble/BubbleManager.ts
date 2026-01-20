import { App, Editor, MarkdownView, Plugin } from "obsidian";
import { singleton } from "tsyringe";
import BubbleContainer from "./BubbleContainer.svelte";
import { LoggerService } from "../../services/LoggerService";
import { ServiceContainer } from "../../core/ServiceContainer";

@singleton()
@singleton()
export class BubbleManager {
  private app!: App;
  private plugin!: Plugin;
  private component: BubbleContainer | null = null;
  private containerEl!: HTMLElement;
  private logger: LoggerService;

  constructor() {
    this.logger = ServiceContainer.getInstance().resolve(LoggerService);
  }

  public initialize(plugin: Plugin) {
    this.plugin = plugin;
    this.app = plugin.app;

    // Create a root element for the bubble to live in
    this.containerEl = document.createElement("div");
    this.containerEl.addClass("synapse-bubble-root");
    document.body.appendChild(this.containerEl);

    // Mount Svelte component
    this.component = new BubbleContainer({
      target: this.containerEl,
      props: {
        visible: false,
        position: { x: 0, y: 0 }
      }
    });

    // Listen for actions from the UI
    this.component.$on("action", (e) => {
      this.handleAction(e.detail);
    });

    // Register DOM events
    this.plugin.registerDomEvent(document, "mouseup", (evt: MouseEvent) => {
      this.handleSelection(evt);
    });

    this.plugin.registerDomEvent(document, "mousedown", (evt: MouseEvent) => {
      // Hide on click outside if we aren't clicking the bubble itself
      // The bubble stops propagation on mousedown, so if we get here, it's outside
      this.hideBubble();
    });

    // Also hide on keyup (typing) using Obsidian's event registry if possible, 
    // strictly speaking document keyup is fine too but we want to be careful not to override shortcuts
    this.plugin.registerDomEvent(document, "keyup", () => {
      this.hideBubble();
    });
  }

  private handleSelection(evt: MouseEvent) {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) {
      this.logger.debug("No active MarkdownView");
      return;
    }

    const editor = activeView.editor;
    // if (!editor.hasFocus()) {
    //    this.logger.debug("Editor does not have focus");
    //     return;
    // }

    const selection = editor.getSelection();
    this.logger.debug(`Selection event triggered. Text: "${selection}"`);

    // Only show if selection is non-empty and reasonably long
    if (selection && selection.trim().length > 0) {
      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) return;

      const range = domSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Ensure valid coordinates
      if (rect.width === 0 && rect.height === 0) return;

      this.logger.debug(`Showing bubble at:`, rect);

      this.showBubble({
        x: rect.left + (rect.width / 2),
        y: rect.top
      });
    } else {
      this.hideBubble();
    }
  }

  private showBubble(pos: { x: number; y: number }) {
    if (this.component) {
      this.component.$set({
        visible: true,
        position: pos
      });
    }
  }

  private hideBubble() {
    if (this.component) {
      this.component.$set({ visible: false });
    }
  }

  private handleAction(actionId: string) {
    this.logger.info(`Bubble action triggered: ${actionId}`);
    // TODO: Implement actual logic (call LLM, etc.)

    // For visual feedback, maybe hide after action?
    // this.hideBubble(); 
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

import { App, Editor, MarkdownView, Plugin } from "obsidian";
import { singleton } from "tsyringe";
import { SettingsManager } from "../../services/SettingsManager";
import BubbleContainer from "./BubbleContainer.svelte";
import { LoggerService } from "../../services/LoggerService";
import { ServiceContainer } from "../../core/ServiceContainer";
import { LLMService } from "../../services/LLM/LLMService";

@singleton()
@singleton()
export class BubbleManager {
  private app!: App;
  private plugin!: Plugin;
  private component: BubbleContainer | null = null;
  private containerEl!: HTMLElement;
  private logger: LoggerService;
  private isPreviewMode = false;

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

    this.component.$on("confirm", (e) => {
      this.applyResult(e.detail.mode, e.detail.text);
    });

    this.component.$on("cancel", () => {
      this.hideBubble();
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
    if (this.component && this.isPreviewMode) {
      // Don't interfere if user is reviewing a preview
      return;
    }

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
      this.isPreviewMode = false;
      this.component.$set({
        visible: true,
        position: pos,
        previewMode: false,
        previewText: ""
      });
    }
  }

  private hideBubble() {
    if (this.component) {
      this.isPreviewMode = false;
      this.component.$set({ visible: false, previewMode: false });
    }
  }

  private async handleAction(actionId: string) {
    this.logger.info(`Bubble action triggered: ${actionId}`);

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) return;

    const editor = activeView.editor;
    const selection = editor.getSelection();

    if (!selection) return;

    // Resolve Settings Manager to get translation preference
    const settingsManager = ServiceContainer.getInstance().resolve(SettingsManager);
    const settings = settingsManager.getSettings();
    const langA = settings.translationLang1 || "English";
    const langB = settings.translationLang2 || "Chinese";

    const llmService = ServiceContainer.getInstance().resolve(LLMService);
    let systemPrompt = "You are a helpful writing assistant.";
    let userPrompt = "";

    switch (actionId) {
      case "polish":
        userPrompt = `Polish the following text for clarity, flow, and conciseness. Only return the polished text:\n\n${selection}`;
        break;
      case "translate":
        userPrompt = `You are a professional translator. 
        If the following text is in ${langA}, translate it to ${langB}. 
        If it is in ${langB} (or any other language), translate it to ${langA}. 
        Only return the translation, no explanations:\n\n${selection}`;
        break;
      case "summarize":
        userPrompt = `Summarize the following text in one concise sentence:\n\n${selection}`;
        break;
      default:
        return;
    }

    // Visual feedback: could show a Notice or update bubble state
    // For MVP, simplified feedback
    // new Notice(`Synapse: Processing ${actionId}...`);

    // Maybe show loading on bubble?
    // this.component.$set({ visible: true }); // Keep visible?

    try {
      const processedText = await llmService.generate(userPrompt, systemPrompt);

      // Instead of replacing, show preview
      if (this.component) {
        this.isPreviewMode = true;
        this.component.$set({
          previewMode: true,
          previewText: processedText
        });
      }
    } catch (error) {
      this.logger.error("Bubble Action Failed", error);
    }
  }

  private applyResult(mode: 'replace' | 'append', text: string) {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!activeView) return;

    const editor = activeView.editor;

    if (mode === 'replace') {
      editor.replaceSelection(text);
    } else if (mode === 'append') {
      const selection = editor.getSelection();
      editor.replaceSelection(`${selection}\n${text}`);
    }

    this.hideBubble();
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

import { Modal, App } from "obsidian";
import OmniBarContainer from "./OmniBarContainer.svelte";

export class OmniBarModal extends Modal {
  private component: OmniBarContainer;

  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl, modalEl } = this;
    // Add a custom class for styling
    modalEl.addClass("synapse-omni-bar-modal");

    // Remove default close button for cleaner UI
    // modalEl.querySelector(".modal-close-button")?.detach(); 

    this.component = new OmniBarContainer({
      target: contentEl,
      props: {
        close: () => this.close(),
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    if (this.component) {
      this.component.$destroy();
    }
    contentEl.empty();
  }
}

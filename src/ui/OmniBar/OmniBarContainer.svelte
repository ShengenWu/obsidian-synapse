<script lang="ts">
  import { onMount } from "svelte";
  import OmniBarInput from "./OmniBarInput.svelte";
  import OmniBarResults from "./OmniBarResults.svelte";
  import { ServiceContainer } from "../../core/ServiceContainer";
  import { LoggerService } from "../../services/LoggerService";
  import { LLMService } from "../../services/LLM/LLMService";
  import { SettingsManager } from "../../services/SettingsManager";
  import {
    HistoryService,
    type ChatSession,
    type ChatMessage,
  } from "../../services/HistoryService";

  export let close: () => void;
  export let visible = false;

  let logger: LoggerService;
  let llmService: LLMService;
  let settingsManager: SettingsManager;
  let historyService: HistoryService;

  let isLoading = false;

  // Chat State
  let activeSession: ChatSession | null = null;
  let messages: ChatMessage[] = [];
  let sessions: ChatSession[] = [];
  let showHistory = false;

  let activeProviderId = "";
  let activeModelId = "";
  let providers: any[] = [];
  let models: string[] = [];

  onMount(async () => {
    const container = ServiceContainer.getInstance();
    logger = container.resolve(LoggerService);
    llmService = container.resolve(LLMService);
    settingsManager = container.resolve(SettingsManager);
    historyService = container.resolve(HistoryService);

    // Load Settings
    const settings = settingsManager.getSettings();
    providers = settings.providers;
    activeProviderId = settings.activeProviderId;
    updateModels();

    // Initialize History State
    await refreshSessions();

    logger.info("OmniBar Mounted");
  });

  // Reactive statement: Whenever visible changes to true, refresh data
  $: if (visible) {
    refreshSessions();
  }

  async function refreshSessions() {
    if (!historyService) return;
    sessions = historyService.getSessions();
    activeSession = historyService.getActiveSession();
    if (activeSession) {
      messages = activeSession.messages;
    } else {
      messages = [];
    }
  }

  function updateModels() {
    const provider = providers.find((p) => p.id === activeProviderId);
    if (provider) {
      models = provider.models;
      activeModelId = provider.defaultModelId;
    } else {
      models = [];
      activeModelId = "";
    }
  }

  async function handleNewChat() {
    await historyService.createSession();
    await refreshSessions();
    showHistory = false;
  }

  async function handleDeleteChat(id: string) {
    await historyService.deleteSession(id);
    await refreshSessions();
  }

  async function handleSwitchChat(id: string) {
    await historyService.setActiveSession(id);
    await refreshSessions();
    showHistory = false;
  }

  async function handleProviderChange() {
    await settingsManager.updateSettings({ activeProviderId });
    updateModels();
    llmService.initializeProvider();
  }

  async function handleModelChange() {
    const providerIndex = providers.findIndex((p) => p.id === activeProviderId);
    if (providerIndex !== -1) {
      providers[providerIndex].defaultModelId = activeModelId;
      await settingsManager.updateSettings({ providers });
    }
    llmService.initializeProvider();
  }

  function handleInput(event: CustomEvent<string>) {
    // Input is handled in component, we just receive keydown events usually?
    // The Input component dispatches 'input' with value, but we bind value there.
    // Here we just wait for submit?
    // Actually OmniBarInput handles binding. We need to catch the "submit" event if defined,
    // OR we define 'query' binding.
    // OmniBarInput emits 'input' event with text.
    // But 'handleSubmit' needs the current text.
    // Let's bind a local 'query' var via the event.
    query = event.detail;
  }

  let query = ""; // Used to track input value to clear it later?
  // Wait, if OmniBarInput handles its own state, how do we clear it?
  // We need to bind `value` on OmniBarInput. Passing `value` prop to it.

  async function handleSubmit() {
    if (!query.trim()) return;
    const userQuery = query;
    query = ""; // Clear input immediately

    isLoading = true;

    try {
      if (!activeSession) {
        await handleNewChat();
      }

      if (activeSession) {
        // 1. Add User Message
        await historyService.addMessage(activeSession.id, "user", userQuery);
        messages = activeSession.messages; // Refresh UI

        // 2. Add Empty Assistant Message
        const aiMsg = await historyService.addMessage(
          activeSession.id,
          "assistant",
          "",
        );
        if (!aiMsg) throw new Error("Failed to create AI message");
        messages = activeSession.messages; // Refresh UI to show empty bubble

        // 3. Stream content
        let fullContent = "";
        for await (const chunk of llmService.stream(userQuery)) {
          fullContent += chunk;
          // Update in memory and UI (optimistically)
          // We update the last message in 'messages' array directly for speed
          const lastMsg = messages[messages.length - 1];
          if (lastMsg && lastMsg.id === aiMsg.id) {
            lastMsg.content = fullContent;
            messages = [...messages]; // Trigger reactivity
          }
        }

        // 4. Save final content
        await historyService.updateMessageContent(
          activeSession.id,
          aiMsg.id,
          fullContent,
        );
      }
    } catch (error: any) {
      logger.error("LLM Error", error);
      // Add error message to chat?
    } finally {
      isLoading = false;
      await refreshSessions(); // Ensure title updates etc
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="synapse-omni-bar is-floating" on:keydown={handleKeydown}>
    <!-- Header / Top Bar -->
    <div class="synapse-omni-header">
      <button
        class="synapse-icon-btn"
        on:click={() => (showHistory = !showHistory)}
      >
        <!-- History Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><circle cx="12" cy="12" r="10"></circle><polyline
            points="12 6 12 12 16 14"
          ></polyline></svg
        >
      </button>
      <span class="synapse-title">{activeSession?.title || "New Chat"}</span>
      <button
        class="synapse-icon-btn"
        on:click={handleNewChat}
        title="New Chat"
      >
        <!-- Plus Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><line x1="12" y1="5" x2="12" y2="19"></line><line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
          ></line></svg
        >
      </button>
    </div>

    <div class="synapse-main-area">
      {#if showHistory}
        <div class="synapse-history-sidebar">
          <div class="synapse-pdf-header">History</div>
          <div class="synapse-history-list">
            {#each sessions as s}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <div
                class="session-item {activeSession?.id === s.id
                  ? 'active'
                  : ''}"
                on:click={() => handleSwitchChat(s.id)}
              >
                <span class="session-title">{s.title}</span>
                <button
                  class="session-delete"
                  on:click|stopPropagation={() => handleDeleteChat(s.id)}
                  >×</button
                >
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Chat Area -->
      <OmniBarResults {messages} {isLoading} />
    </div>

    <!-- Input Section -->
    <OmniBarInput bind:value={query} on:input={handleInput} />

    <div class="synapse-omni-footer">
      <div class="synapse-selectors">
        <select
          class="synapse-select"
          bind:value={activeProviderId}
          on:change={handleProviderChange}
        >
          {#each providers as p}
            <option value={p.id}>{p.name}</option>
          {/each}
        </select>
        <select
          class="synapse-select"
          bind:value={activeModelId}
          on:change={handleModelChange}
        >
          {#each models as m}
            <option value={m}>{m}</option>
          {/each}
        </select>
      </div>
      <button
        class="synapse-send-btn"
        on:click={handleSubmit}
        disabled={isLoading}
      >
        <!-- Paper Plane Icon SVG -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><line x1="22" y1="2" x2="11" y2="13"></line><polygon
            points="22 2 15 22 11 13 2 9 22 2"
          ></polygon></svg
        >
      </button>
    </div>
  </div>
{/if}

<style>
  /* Scoped Svelte Styles - or use global if preferred, keeping scoped for component specifics */
  .synapse-omni-bar.is-floating {
    display: flex;
    flex-direction: column;
    width: 650px;
    max-width: 90vw;
    height: 600px; /* Fixed height for chat view */
    max-height: 80vh;
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 1000; /* High z-index to sit on top */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* Centered */
    overflow: hidden;
  }

  .synapse-omni-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: var(--background-secondary);
    border-bottom: 1px solid var(--background-modifier-border);
  }

  .synapse-title {
    font-weight: bold;
    font-size: 0.9em;
    color: var(--text-normal);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }

  .synapse-icon-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
  }

  .synapse-icon-btn:hover {
    background: var(--background-modifier-hover);
    color: var(--text-normal);
  }

  .synapse-main-area {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  .synapse-history-sidebar {
    width: 200px;
    background: var(--background-secondary);
    border-right: 1px solid var(--background-modifier-border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .synapse-pdf-header {
    padding: 8px;
    font-size: 0.8em;
    font-weight: bold;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .synapse-history-list {
    display: flex;
    flex-direction: column;
  }

  .session-item {
    padding: 8px 10px;
    font-size: 0.9em;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-normal);
  }

  .session-item:hover,
  .session-item.active {
    background: var(--background-modifier-hover);
  }

  .session-item.active {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
  }

  .session-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    margin-right: 5px;
  }

  .session-delete {
    background: transparent;
    border: none;
    color: inherit;
    opacity: 0.5;
    cursor: pointer;
    font-size: 1.1em;
    padding: 0 4px;
  }

  .session-delete:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .synapse-omni-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--background-secondary);
    border-top: 1px solid var(--background-modifier-border);
  }

  .synapse-selectors {
    display: flex;
    gap: 10px;
  }

  .synapse-select {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    color: var(--text-normal);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.85em;
    outline: none;
    cursor: pointer;
  }

  .synapse-select:hover {
    border-color: var(--interactive-accent);
  }

  .synapse-send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    border: none;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .synapse-send-btn:hover {
    background: var(--interactive-accent-hover);
  }

  .synapse-send-btn:disabled {
    background: var(--background-modifier-border);
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>

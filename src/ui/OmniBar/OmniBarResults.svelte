<script lang="ts">
  import { afterUpdate } from "svelte";
  import type { ChatMessage } from "../../services/HistoryService";

  export let messages: ChatMessage[] = [];
  export let isLoading = false;

  let scrollContainer: HTMLDivElement;

  afterUpdate(() => {
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });

  const formatContent = (text: string) => text.replace(/\n/g, "<br/>");
</script>

<div class="synapse-chat-view" bind:this={scrollContainer}>
  {#if messages.length === 0}
    <div class="synapse-placeholder">
      <h3>Synapse Assistant</h3>
      <p>Type to start a new conversation...</p>
    </div>
  {:else}
    {#each messages as msg}
      <div class="synapse-message-row {msg.role}">
        <div class="synapse-message-bubble {msg.role}">
          {#if msg.role === "user"}
            <div class="message-content">{msg.content}</div>
          {:else}
            <div class="message-content">
              {@html formatContent(msg.content)}
            </div>
          {/if}
        </div>
      </div>
    {/each}

    {#if isLoading}
      <!-- Optional Loading Indicator -->
    {/if}
  {/if}
</div>

<style>
  .synapse-chat-view {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
    min-height: 200px;
    max-height: 500px;
  }

  .synapse-message-row {
    display: flex;
    width: 100%;
  }

  .synapse-message-row.user {
    justify-content: flex-end;
  }

  .synapse-message-row.assistant {
    justify-content: flex-start;
  }

  .synapse-message-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 0.95em;
    line-height: 1.5;
    word-wrap: break-word;
    user-select: text;
  }

  .synapse-message-bubble.user {
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
    border-bottom-right-radius: 2px;
  }

  .synapse-message-bubble.assistant {
    background-color: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    color: var(--text-normal);
    border-bottom-left-radius: 2px;
  }

  .synapse-placeholder {
    text-align: center;
    margin-top: 40px;
    color: var(--text-muted);
  }

  .message-content :global(p) {
    margin-block-start: 0;
    margin-block-end: 0.5em;
  }

  .message-content :global(p:last-child) {
    margin-block-end: 0;
  }
</style>

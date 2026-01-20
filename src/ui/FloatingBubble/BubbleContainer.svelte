<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";

  const dispatch = createEventDispatcher();

  export let position = { x: 0, y: 0 };
  export let visible = false;

  // Simple preset actions for MVP
  const actions = [
    { label: "✨ Polish", id: "polish" },
    { label: "🌐 Translate", id: "translate" },
    { label: "📝 Summarize", id: "summarize" },
  ];

  function handleAction(actionId: string) {
    dispatch("action", actionId);
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="synapse-floating-bubble"
    style="top: {position.y}px; left: {position.x}px;"
    transition:fly={{ y: 10, duration: 200 }}
    on:mousedown|stopPropagation
  >
    {#each actions as action}
      <button
        class="synapse-bubble-btn"
        on:click={() => handleAction(action.id)}
      >
        {action.label}
      </button>
    {/each}
  </div>
{/if}

<style>
  .synapse-floating-bubble {
    position: fixed;
    z-index: 9999;
    display: flex;
    gap: 6px;
    padding: 6px;
    background-color: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    pointer-events: auto;
    transform: translate(-50%, -100%); /* Center horizontally, place above */
    margin-top: -10px; /* Spacing from cursor */
  }

  .synapse-bubble-btn {
    background: transparent;
    border: none;
    color: var(--text-normal);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.1s ease;
  }

  .synapse-bubble-btn:hover {
    background-color: var(--background-modifier-hover);
    color: var(--text-accent);
  }
</style>

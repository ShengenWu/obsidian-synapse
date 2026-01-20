<script lang="ts">
    export let query = "";
</script>

<div class="synapse-results">
    {#if query}
        <div class="synapse-result-item">
            <span class="synapse-icon">🔍</span>
            <span class="synapse-text">Searching for: <strong>{query}</strong></span>
        </div>
    {:else}
        <div class="synapse-placeholder">
            Type to start searching or interacting with AI...
        </div>
    {/if}
</div>

<style>
    .synapse-results {
        padding: 10px;
        min-height: 200px;
        max-height: 400px;
        overflow-y: auto;
    }
    .synapse-result-item {
        padding: 8px 12px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
    }
    .synapse-result-item:hover {
        background-color: var(--background-modifier-hover);
    }
    .synapse-placeholder {
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
    }
</style>

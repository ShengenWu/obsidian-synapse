<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import OmniBarInput from "./OmniBarInput.svelte";
    import OmniBarResults from "./OmniBarResults.svelte";
    import { ServiceContainer } from "../../core/ServiceContainer";
    import { LoggerService } from "../../services/LoggerService";

    export let close: () => void;

    let query = "";
    let logger: LoggerService;

    onMount(() => {
        logger = ServiceContainer.getInstance().resolve(LoggerService);
        logger.info("OmniBar Mounted");
    });

    function handleInput(event: CustomEvent<string>) {
        query = event.detail;
        logger?.debug(`Query updated: ${query}`);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            close();
        }
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="synapse-omni-bar" on:keydown={handleKeydown}>
    <OmniBarInput on:input={handleInput} />
    <OmniBarResults {query} />
</div>

<style>
    .synapse-omni-bar {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
    }
</style>

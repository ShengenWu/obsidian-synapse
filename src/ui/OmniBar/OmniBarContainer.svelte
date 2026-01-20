    import { onMount, onDestroy } from "svelte";
    import OmniBarInput from "./OmniBarInput.svelte";
    import OmniBarResults from "./OmniBarResults.svelte";
    import { ServiceContainer } from "../../core/ServiceContainer";
    import { LoggerService } from "../../services/LoggerService";
    import { LLMService } from "../../services/LLM/LLMService";

    export let close: () => void;

    let query = "";
    let logger: LoggerService;
    let llmService: LLMService;
    let isLoading = false;
    let result = "";

    onMount(() => {
        const container = ServiceContainer.getInstance();
        logger = container.resolve(LoggerService);
        llmService = container.resolve(LLMService);
        logger.info("OmniBar Mounted");
        
        // Focus input handling is done in OmniBarInput
    });

    function handleInput(event: CustomEvent<string>) {
        query = event.detail;
    }

    async function handleSubmit() {
        if (!query.trim()) return;
        
        isLoading = true;
        result = ""; // Clear previous
        
        try {
            logger.info(`Sending query to LLM: ${query}`);
            // Simple non-streaming call for MVP first, or simulated stream
            // const response = await llmService.generate(query);
            // result = response;

            // Let's try the stream simulation we wrote
            for await (const chunk of llmService.stream(query)) {
                result += chunk;
            }
        } catch (error) {
            logger.error("LLM Error", error);
            result = `Error: ${error.message}`;
        } finally {
            isLoading = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            close();
        }
        if (event.key === "Enter" && !event.shiftKey) {
            // Only trigger if not loading? Or cancel previous?
            event.preventDefault();
            handleSubmit();
        }
    }

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="synapse-omni-bar" on:keydown={handleKeydown}>
    <OmniBarInput on:input={handleInput} />
    <OmniBarResults {query} {result} {isLoading} />
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

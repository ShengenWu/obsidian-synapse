<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    let inputEl: HTMLInputElement;

    export let value = "";

    function handleInput() {
        dispatch("input", value);
    }

    onMount(() => {
        inputEl?.focus();
    });
</script>

<div class="synapse-input-wrapper">
    <input 
        bind:this={inputEl}
        type="text" 
        bind:value 
        on:input={handleInput} 
        placeholder="Ask Synapse or type a command..."
    />
</div>

<style>
    .synapse-input-wrapper {
        padding: 10px;
        border-bottom: 1px solid var(--background-modifier-border);
    }
    input {
        width: 100%;
        font-size: 1.2em;
        border: none;
        background: transparent;
        outline: none;
    }
    input:focus {
        box-shadow: none;
        border: none;
    }
</style>

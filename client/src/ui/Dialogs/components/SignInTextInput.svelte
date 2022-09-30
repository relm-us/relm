<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label = null;
  export let type: "text" | "email" | "password" = "text";
  export let value = "";
  export let inputEl = null;

  const dispatch = createEventDispatcher();

  function onKey(event) {
    if (event.key === "Enter" || event.key === "Return") {
      dispatch("submit");
    }
  }

  export function focus() {
    inputEl.focus();
  }
</script>

<r-signin-text-input>
  {#if type === "text"}
    <input
      type="text"
      placeholder={label}
      bind:value
      bind:this={inputEl}
      on:keypress={onKey}
    />
  {:else if type === "email"}
    <input
      type="email"
      placeholder={label}
      bind:value
      bind:this={inputEl}
      on:keypress={onKey}
    />
  {:else if type === "password"}
    <input
      type="password"
      placeholder={label}
      bind:value
      bind:this={inputEl}
      on:keypress={onKey}
    />
  {/if}
</r-signin-text-input>

<style lang="scss">
  r-signin-text-input {
    display: block;
    width: 100%;
  }

  input {
    width: calc(100% - 6px);
    height: 1.5em;
    padding: 0 3px;

    font-size: 16px;
    background: none;
    border: none;
    outline: none;
    border-bottom: 1px solid var(--orange);
    color: var(--selected-orange);
    margin-bottom: 0.5px;
  }

  input:focus {
    outline: none;
    border-bottom: 1.5px solid var(--selected-orange);
    margin-bottom: 0px;
  }
  input::placeholder {
    color: var(--orange);
  }

  // Hide the placeholder text when the element is in focus
  input:focus::placeholder {
    opacity: 0;
  }
</style>

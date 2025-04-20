<script lang="ts">
export let value = ""
export let placeholder = "Search..."
</script>

<r-search>
  <input
    name="search"
    type="text"
    {placeholder}
    autocomplete="off"
    spellcheck="false"
    bind:value
    on:input
    on:change
    on:focus
    on:blur
    on:keydown
  />
  <span
    data-clear-input
    class:hidden={value == ""}
    on:click={() => (value = "")}>&times;</span
  >
</r-search>

<style>
  r-search {
    position: relative;
    display: inline-block;
  }
  r-search > input {
    padding-right: 1.4em;
  }
  r-search > [data-clear-input] {
    position: absolute;
    top: 3px;
    right: 5px;
    font-weight: bold;
    font-size: 22px;
    padding: 0 6px;
    line-height: 1em;
    cursor: pointer;
    color: var(--foreground-dark-gray);
  }
  r-search > input::-ms-clear {
    display: none;
  }
  input {
    padding: 4px 16px;
    font-size: 16px;
    border-radius: 16px;
    width: calc(calc(100% - 1.4em) - 18px);
    border: 2px solid var(--selected-red);
  }
  .hidden {
    display: none;
  }
</style>

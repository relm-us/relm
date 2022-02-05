<script lang="ts">
  export let value: string;
</script>

<button on:click>#{value}</button>

<style>
  button {
    margin: 4px;
    padding: 2px 8px;
    border: 1px solid var(--foreground-dark-gray);
    border-radius: 4px;

    cursor: pointer;
  }
</style>

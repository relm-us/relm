<script lang="ts">
  import Button from "~/ui/lib/Button";

  export let shortcut: string;
</script>

<r-tool-button>
  <Button on:click>
    <r-icon><slot /></r-icon>
    <r-shortcut-key>{shortcut}</r-shortcut-key>
  </Button>
</r-tool-button>

<style>
  r-tool-button {
    display: block;
    position: relative;
  }

  r-icon {
    display: block;
    width: 24px;
    height: 24px;
  }

  r-shortcut-key {
    display: block;

    position: absolute;
    bottom: -10px;
    left: 11px;
    width: 12px;
    height: 12px;

    padding: 2px;
    border-radius: 100%;
    background: var(--background-gray);
    color: var(--foreground-white);
    border: 1px solid var(--foreground-white);
    font-size: 10px;
  }
</style>

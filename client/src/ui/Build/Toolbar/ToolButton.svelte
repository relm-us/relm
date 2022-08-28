<script lang="ts">
  import Button from "~/ui/lib/Button";

  export let shortcut: string;
  export let bgState: number = 0;

  let style;

  $: switch (bgState) {
    case 1:
      style = "--bg-color: #89cf82";
      break;
    default:
      style = null;
      break;
  }
</script>

<r-tool-button {style}>
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

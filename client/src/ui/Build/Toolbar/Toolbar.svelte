<script lang="ts">
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
  import IoIosArrowUp from "svelte-icons/io/IoIosArrowUp.svelte";

  import Button from "~/ui/lib/Button";
</script>

<r-toolbar>
  <Button>
    <r-icon><IoIosArrowDown /></r-icon>
  </Button>
  <Button>
    <r-icon><IoIosArrowUp /></r-icon>
  </Button>
</r-toolbar>

<style>
  r-toolbar {
    display: flex;
    padding: 8px;
    background: var(--background-gray);
    border-radius: 4px;
    height: min-content;

    /* Custom CSS for buttons within Toolbar */
    --margin: 2px;
    --padv: 6px;
    --padh: 6px;
    --top-radius: 2px;
    --right-radius: 2px;
    --bottom-radius: 2px;
    --left-radius: 2px;

    --bg-hover-color: var(--foreground-gray, gray);
    --bg-color: var(--foreground-white, white);
    --fg-color: var(--background-gray, black);
  }

  r-icon {
    display: block;
    width: 24px;
    height: 24px;
  }
</style>

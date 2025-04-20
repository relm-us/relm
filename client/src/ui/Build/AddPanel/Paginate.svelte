<script lang="ts">
import IoMdArrowRoundBack from "svelte-icons/io/IoMdArrowRoundBack.svelte"
import IoMdArrowRoundForward from "svelte-icons/io/IoMdArrowRoundForward.svelte"

import { libraryPage } from "~/stores/libraryAssets"
import Button from "~/ui/lib/Button"

export let assetCount = 0

function prevPage() {
  if ($libraryPage > 0) $libraryPage = $libraryPage - 1
}

function nextPage() {
  $libraryPage = $libraryPage + 1
}
</script>

<r-pagination>
  <r-left>
    {#if $libraryPage > 0}
      <Button on:click={prevPage}>
        <r-icon><IoMdArrowRoundBack /></r-icon>
      </Button>
    {/if}
  </r-left>
  <r-center>
    <r-page>p. {$libraryPage + 1}</r-page>
  </r-center>
  <r-right>
    {#if assetCount > 0}
      <Button on:click={nextPage}>
        <r-icon><IoMdArrowRoundForward /></r-icon>
      </Button>
    {/if}
  </r-right>
</r-pagination>

<style>
  r-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 38.5px;

    /* Next/Prev Buttons */
    --margin: 0;
    --padv: 1px;
    --bg-color: var(--selected-red);
    --bg-hover-color: var(--selected-red-hover);
    --fg-color: white;
  }

  r-left,
  r-center,
  r-right {
    display: flex;
    width: 33.33%;
  }
  r-left {
    justify-content: flex-start;
  }
  r-center {
    justify-content: center;
  }
  r-right {
    justify-content: flex-end;
  }

  r-icon {
    display: block;
    width: 24px;
    height: 24px;
  }

  r-page {
    display: block;
    color: var(--foreground-white);
  }
</style>

<script lang="ts">
  import { fade } from "svelte/transition";
  import { cleanHtml } from "~/utils/cleanHtml";

  export let sections;
  export let sectionIndex;
</script>

<r-scroll>
  {#each sections as section, i}
    {#if sectionIndex === i}
      <r-content in:fade|local={{ duration: 500 }}>
        {@html cleanHtml(section)}
      </r-content>
    {/if}
  {/each}
</r-scroll>

<style>
  r-scroll {
    display: block;
    overflow-y: auto;
    margin-top: 12px;
  }

  r-content {
    margin-top: 4px;
    margin-left: 12px;
  }
</style>

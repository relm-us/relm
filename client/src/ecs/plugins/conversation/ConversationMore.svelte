<script lang="ts">
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";

  export let sections;
  export let sectionIndex;
</script>

{#if sections.length > 1 && sectionIndex < sections.length - 1}
  <r-more-content>
    <icon><IoIosArrowDown /></icon>
  </r-more-content>
{/if}

<style>
  r-more-content {
    text-align: center;
    align-self: center;
    margin-top: 10px;
  }
  icon {
    display: block;
    width: 24px;
    height: 24px;
  }
</style>

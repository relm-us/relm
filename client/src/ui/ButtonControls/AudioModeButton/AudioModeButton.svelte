<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { audioMode } from "~/stores/audioMode";
  import IoIosColorFilter from "svelte-icons/io/IoIosColorFilter.svelte";
  import IoIosRadio from "svelte-icons/io/IoIosRadio.svelte";

  function toggle() {
    audioMode.update(($audioMode) => {
      if ($audioMode === "world") return "proximity";
      else return "world";
    });
  }
</script>

<CircleButton on:click={toggle}>
  {#if $audioMode === "world"}
    <icon>
      <IoIosRadio />
    </icon>
  {:else}
    <icon class="off">
      <IoIosColorFilter />
    </icon>
  {/if}
</CircleButton>

<style>
  .off {
    color: var(--selected-red, red);
    border-color: var(--selected-red, red);
  }
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
</style>

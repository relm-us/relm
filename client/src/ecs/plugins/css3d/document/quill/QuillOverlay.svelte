<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IoIosArrowForward from "svelte-icons/io/IoIosArrowForward.svelte";
  import IoIosArrowBack from "svelte-icons/io/IoIosArrowBack.svelte";

  export let cloudy: boolean = false;
  export let showPrev: boolean = false;
  export let showNext: boolean = false;

  const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<r-overlay class:cloudy on:click>
  {#if showPrev}
    <r-nav
      class="prev"
      on:click|stopPropagation={() => dispatch("prev")}
      on:pointerup|stopPropagation
    >
      <r-icon><IoIosArrowBack /></r-icon>
    </r-nav>
  {/if}
  {#if showNext}
    <r-nav
      class="next"
      on:click|stopPropagation={() => dispatch("next")}
      on:pointerup|stopPropagation
    >
      <r-icon><IoIosArrowForward /></r-icon>
    </r-nav>
  {/if}
</r-overlay>

<style>
  r-overlay {
    position: absolute;
    z-index: 2;

    left: 0;
    top: 0;

    width: 100%;
    height: 100%;
  }

  r-nav {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 10%;
    min-width: 36px;

    height: 40%;
    min-height: 36px;

    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    color: var(--foreground-white, #fff);
    background-color: var(--background-transparent-gray, #333);
    border-radius: 8px;

    cursor: pointer;
  }

  r-nav:hover {
    background-color: var(--background-transparent-black, #000);
  }

  r-nav.prev {
    left: 0;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }

  r-nav.next {
    right: 0;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  r-icon {
    display: block;
    width: 36px;
    height: 36px;
  }

  .cloudy {
    opacity: 0.5;
    background-color: white;
  }
</style>

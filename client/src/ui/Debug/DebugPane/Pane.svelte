<script lang="ts">
import { createEventDispatcher } from "svelte"

// https://svelte-icons.vercel.app/
import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte"
import IoIosArrowUp from "svelte-icons/io/IoIosArrowUp.svelte"

export let title: string
export let subtitle: string = null
export let minimized = false
export let showMinimize = false

const dispatch = createEventDispatcher()
</script>

<pane>
  <header>
    <titles>
      {#if title}
        <title1>{title}</title1>
      {/if}
      {#if subtitle}
        <title2>{subtitle}</title2>
      {/if}
    </titles>

    <controls>
      {#if showMinimize}
        <icon
          class="minimize"
          on:mousedown|preventDefault={() => {
            minimized = !minimized;
            dispatch("minimize", minimized);
          }}
        >
          {#if minimized}
            <IoIosArrowDown />
          {:else}
            <IoIosArrowUp />
          {/if}
        </icon>
      {/if}
    </controls>
  </header>

  {#if !minimized}
    <content>
      <slot />
    </content>
  {/if}
</pane>

<style>
  pane {
    min-width: var(--pane-width, 32px);
    background-color: var(--bg-color, rgba(0, 0, 0, 0.25));
    border-radius: 5px;

    margin: var(--pane-margin, 0px 16px);
  }

  header {
    display: flex;
    justify-content: space-between;
  }

  titles {
    display: flex;
    flex-direction: column;
  }

  controls {
    display: flex;
    align-items: flex-start;
  }

  title1 {
    display: block;
    padding: 4px 16px 4px 16px;
    color: var(--title-color, rgba(240, 240, 240, 1));
    font-weight: bold;
    letter-spacing: 0.5px;
  }

  title2 {
    display: block;
    padding: 0px 16px 4px 16px;
    color: var(--subtitle-color, rgba(48, 48, 48, 1));
  }

  icon {
    display: block;
    margin-top: 4px;
    margin-right: 6px;

    cursor: pointer;
    pointer-events: all;

    color: var(--title-color, rgba(240, 240, 240, 1));
  }
  icon.minimize {
    top: 6px;
    width: 16px;
    height: 16px;
  }
  content {
    display: block;
    margin-top: 8px;
    border-top: 1px solid rgba(48, 48, 48, 1);
  }
</style>

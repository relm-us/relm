<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import FaUserAlt from "svelte-icons/fa/FaUserAlt.svelte";
  import { worldManager } from "~/world";
  import { AvatarBuilder } from "~/ui/AvatarBuilder";
  import { getDefaultAppearance } from "~/identity/Avatar/appearance";

  let showBuilder = false;
  let builderEl;

  const onClick = () => {
    showBuilder = !showBuilder;
  };

  // escape absolute/relative positioned elements
  $: if (showBuilder && builderEl) document.body.appendChild(builderEl);
</script>

<CircleButton on:click={onClick} padding={0}>
  <icon>
    <FaUserAlt />
  </icon>
  <slot />
</CircleButton>

{#if showBuilder}
  <div class="builder" bind:this={builderEl}>
    <AvatarBuilder
      on:click={() => (showBuilder = false)}
      {...worldManager.participants.getAppearance()}
    />
  </div>
{/if}

<style>
  icon {
    display: block;
    width: 28px;
    height: 28px;
    margin: 0 auto;
  }

  .builder {
    position: absolute;
    z-index: 4;
    top: 0;
    right: 8px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    width: 200px;
    height: 100vh;

    pointer-events: all;
  }
</style>

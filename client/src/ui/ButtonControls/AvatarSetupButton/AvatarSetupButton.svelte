<script lang="ts">
  import Button from "~/ui/lib/Button";
  import IoIosHappy from "svelte-icons/io/IoIosHappy.svelte";
  import { Relm } from "~/stores/Relm";
  import { AvatarBuilder } from "~/ui/AvatarBuilder";
  import { getDefaultAppearance } from "~/identity/appearance";

  let showBuilder = false;
  let builderEl;

  const onClick = () => {
    showBuilder = !showBuilder;
  };

  // escape absolute/relative positioned elements
  $: if (showBuilder && builderEl) document.body.appendChild(builderEl);

</script>

<Button on:click={onClick}>
  <icon>
    <IoIosHappy />
  </icon>
  <slot />
</Button>

{#if showBuilder}
  <div class="builder" bind:this={builderEl}>
    <AvatarBuilder
      on:click={() => (showBuilder = false)}
      {...$Relm.identities.me.get("appearance") || getDefaultAppearance("male")}
    />
  </div>
{/if}

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
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

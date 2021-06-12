<script lang="ts">
  import Button from "~/ui/Button";
  import IoIosHappy from "svelte-icons/io/IoIosHappy.svelte";
  import { AvatarBuilder } from "~/ui/AvatarBuilder";

  let showBuilder = false;

  const onClick = () => {
    showBuilder = !showBuilder;
  };

</script>

<Button on:click={onClick}>
  <icon>
    <IoIosHappy />
  </icon>
  <slot />
</Button>

{#if showBuilder}
  <div class="builder">
    <AvatarBuilder on:click={() => (showBuilder = false)} />
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

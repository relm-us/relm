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
    <AvatarBuilder />
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
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    border-radius: 8px;
    border: 1px solid var(--foreground-white);
    background-color: var(--background-transparent-gray);
    pointer-events: all;
    padding: 8px;
  }
</style>

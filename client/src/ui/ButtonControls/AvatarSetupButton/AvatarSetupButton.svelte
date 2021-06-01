<script lang="ts">
  import Button from "~/ui/Button";
  import IoIosHappy from "svelte-icons/io/IoIosHappy.svelte";
  
  import { setupState } from "~/stores/setupState";

  const onClick = () => {
    $setupState = "avatar";
  };

</script>

<Button on:click={onClick}>
  <icon>
    <IoIosHappy />
  </icon>
  <slot />
</Button>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }

</style>

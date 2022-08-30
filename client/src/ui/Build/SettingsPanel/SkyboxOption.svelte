<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { assetUrl } from "~/config/assetUrl";

  export let name;
  export let value;
  export let thumbnail;

  const dispatch = createEventDispatcher();

  const click = (asset) => () => {
    dispatch("choose", asset);
  };
</script>

<button on:click={click(value)}>
  <img src={assetUrl(thumbnail)} alt={name} />
</button>

<style>
  button {
    display: flex;
    padding: 0;
    margin: 4px;
    border-radius: 5px;
  }

  img {
    border-radius: 3px;
    object-fit: cover;
    width: 75px;
    height: 75px;
  }
</style>

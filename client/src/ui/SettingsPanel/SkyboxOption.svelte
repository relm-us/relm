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

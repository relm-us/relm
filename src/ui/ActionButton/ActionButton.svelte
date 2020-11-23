<script lang="ts">
  import Button from "../Button";
  import { store as world } from "~/world/store";
  import { makePileOfBoxes } from "~/prefab";
  const action = () => {
    makePileOfBoxes($world, { count: 10 });
  };
</script>

<Button on:click={action}>Action</Button>

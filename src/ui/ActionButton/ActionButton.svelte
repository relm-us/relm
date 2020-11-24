<script lang="ts">
  import Button from "../Button";
  import { world } from "~/stores/world";
  import { worldManager } from "~/stores/worldManager";
  import { makePileOfBoxes, makeDemo } from "~/prefab";

  const onClick = () => {
    // makePileOfBoxes($world, { count: 10 });
    for (const entity of makeDemo($world)) {
      console.log("sync entity", entity.toJSON());
      $worldManager.wdoc.syncFrom(entity);
    }
  };
</script>

<Button on:click={onClick}>Action</Button>

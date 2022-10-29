<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";

  import MoveIcon from "./icons/MoveIcon.svelte";
  import RotateIcon from "./icons/RotateIcon.svelte";
  import ScaleIcon from "./icons/ScaleIcon.svelte";

  import { TransformControlsRef } from "~/ecs/plugins/transform-controls";
  import { worldManager } from "~/world";

  const choose = (mode) => () => {
    worldManager.transformEntity
      ?.get(TransformControlsRef)
      ?.value.setMode(mode);
  };
</script>

<div class="transform-buttons">
  <CircleButton Icon={MoveIcon} on:click={choose("translate")} />
  <CircleButton Icon={RotateIcon} on:click={choose("rotate")} />
  <CircleButton Icon={ScaleIcon} on:click={choose("scale")} />
</div>

<style>
  .transform-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 6px;
  }
</style>

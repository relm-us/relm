<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import MdRotateLeft from "svelte-icons/md/MdRotateLeft.svelte";
  import MdTransform from "svelte-icons/md/MdTransform.svelte";
  import MdAspectRatio from "svelte-icons/md/MdAspectRatio.svelte";
  import { TransformControlsRef } from "~/ecs/plugins/transform-controls";
  import { worldManager } from "~/world";

  const choose = (mode) => () => {
    worldManager.transformEntity
      ?.get(TransformControlsRef)
      ?.value.setMode(mode);
  };
</script>

<div class="transform-buttons">
  <CircleButton Icon={MdTransform} on:click={choose("translate")} />
  <CircleButton Icon={MdRotateLeft} on:click={choose("rotate")} />
  <CircleButton Icon={MdAspectRatio} on:click={choose("scale")} />
</div>

<style>
  .transform-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 6px;
  }
</style>

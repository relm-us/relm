<script lang="ts">
  import nipplejs from "nipplejs";
  import { onMount } from "svelte";
  import { Vector2 } from "three";

  import { controlDirection } from "~/stores/controlDirection";

  export function begin(pointerdownEvent: PointerEvent, _onEnd: Function) {
    enabled = true;
    onEnd = _onEnd;
    zone.dispatchEvent(pointerdownEvent);
  }

  let zone;
  let manager;
  let enabled = false;
  let onEnd;

  function move(_evt, { vector, force }) {
    controlDirection.update((dir) => {
      dir.set(vector.x, -vector.y).multiplyScalar(force * 0.75);
      return dir;
    });
  }

  function end(_evt) {
    controlDirection.set(new Vector2(0, 0));
    enabled = false;
    onEnd?.();
  }

  onMount(() => {
    manager = nipplejs.create({
      zone,
      dynamicPage: true,
    });

    manager.on("added", (_evt, n: any) => {
      n.on("move", move);
      n.on("end", end);
    });
    manager.on("removed", (_evt, n: any) => {
      n.off("move", move);
      n.off("end", end);
    });

    return () => {
      manager.destroy();
    };
  });
</script>

<r-joystick bind:this={zone} class:enabled />

<style>
  r-joystick {
    display: block;

    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  .enabled {
    pointer-events: all;
  }
</style>

<script lang="ts">
  import { Vector3 } from "three";
  import { onMount } from "svelte";
  import FaMap from "svelte-icons/fa/FaMap.svelte";

  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores";

  import CircleButton from "~/ui/lib/CircleButton";

  import MapParticipant from "./MapParticipant.svelte";

  let center = new Vector3();

  let size = new Vector3();

  let enabled = true;

  let mapDiameter = 150;
  let worldDiameter;
  let otherPositions = [];
  let myPosition = null;

  function onClick(event) {
    if ($worldUIMode === "build") {
      const x = event.clientX - event.target.offsetLeft - 1;
      const y = event.clientY - event.target.offsetTop + 13;
      const mR = mapDiameter / 2;
      const wR = worldDiameter / 2;
      worldManager.moveToXZ(((x - mR) / mR) * wR, ((y - mR) / mR) * wR);
    } else {
      enabled = false;
    }
  }

  onMount(() => {
    const interval1 = setInterval(() => {
      try {
        otherPositions = worldManager.participants.actives.map((pt) => {
          return pt.avatar.position;
        });
        if (worldManager.participants.local.avatar)
          myPosition = worldManager.participants.local.avatar.position;
      } catch (err) {
        // When unloading the world, it's possible pt.avatar.position will
        // fail, but we don't care
      }
    }, 75);

    const interval2 = setInterval(() => {
      worldManager.boundingBox.getCenter(center);
      worldManager.boundingBox.getSize(size);
      worldDiameter = size.x > size.z ? size.x : size.z;
    }, 1500);

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  });
</script>

{#if enabled}
  <r-mini-map on:click={onClick}>
    <r-centered>
      {#each otherPositions as pos}
        <MapParticipant
          x={((pos.x - center.x) * mapDiameter) / worldDiameter}
          y={((pos.z - center.z) * mapDiameter) / worldDiameter}
        />
      {/each}
      {#if myPosition}
        <MapParticipant
          color="#f0d909"
          x={((myPosition.x - center.x) * mapDiameter) / worldDiameter}
          y={((myPosition.z - center.z) * mapDiameter) / worldDiameter}
        />
      {/if}
    </r-centered>
  </r-mini-map>
{:else}
  <r-ui>
    <CircleButton on:click={() => (enabled = true)}>
      <icon><FaMap /></icon>
    </CircleButton>
  </r-ui>
{/if}

<style>
  r-mini-map {
    display: block;
    position: absolute;
    z-index: 1;
    left: 12px;
    bottom: 12px;
    width: 150px;
    height: 150px;
    border-radius: 8px;
    border-left: 1px solid #aaa;
    border-right: 1px solid #111;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #222;

    background-color: var(--bg-color, rgba(0, 0, 0, 0.4));
    overflow: hidden;
  }

  r-centered {
    position: relative;
    left: 50%;
    top: 50%;
  }
  r-ui {
    display: block;
    position: absolute;
    z-index: 1;
    left: 16px;
    bottom: 16px;
    width: 48px;
    height: 48px;
  }
  icon {
    display: block;
    width: 24px;
    height: 24px;
  }
</style>

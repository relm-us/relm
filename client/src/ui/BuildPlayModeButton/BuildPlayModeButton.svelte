<script lang="ts">
  import Button from "~/ui/lib/Button";
  import { worldUIMode } from "~/stores/worldUIMode";
  import { globalEvents } from "~/events";

  import IoIosBuild from "svelte-icons/io/IoIosBuild.svelte";
  import IoIosRocket from "svelte-icons/io/IoIosRocket.svelte";

  const playMode = () => {
    globalEvents.emit("switch-mode", "play");
  };

  const buildMode = () => {
    globalEvents.emit("switch-mode", "build");
  };
</script>

<contain-build class:selected={$worldUIMode == "build"}>
  <Button on:click={buildMode} style="min-width:80px">
    <icon>
      <IoIosBuild />
    </icon>
    Build
  </Button>
</contain-build>

<contain-play class:selected={$worldUIMode == "play"}>
  <Button on:click={playMode} style="min-width:80px">
    <icon>
      <IoIosRocket />
    </icon>
    Play
  </Button>
</contain-play>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }

  contain-build,
  contain-play {
    --margin: 0px;
  }
  contain-build {
    --right-radius: 0px;
  }

  contain-play {
    --left-radius: 0px;
  }
  contain-build.selected,
  contain-play.selected {
    --bg-color: var(--selected-red);
    --bg-hover-color: var(--selected-red-hover);
  }
</style>

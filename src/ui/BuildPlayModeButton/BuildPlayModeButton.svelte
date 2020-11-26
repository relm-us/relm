<script lang="ts">
  import Button from "../Button";
  import { mode } from "~/stores/mode";
  import { selectedEntities } from "~/stores/selection";

  import IoIosBuild from "svelte-icons/io/IoIosBuild.svelte";
  import IoIosRocket from "svelte-icons/io/IoIosRocket.svelte";

  const playMode = () => {
    $mode = "play";
    selectedEntities.clear();
  };

  const buildMode = () => {
    $mode = "build";
  };
</script>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }

  contain-build {
    --margin: 0px;
    --right-radius: 0px;
  }
  contain-build.selected {
    --bg-color: rgba(255, 80, 80, 0.75);
    --bg-hover-color: rgba(220, 0, 0, 0.75);
  }

  contain-play {
    --margin: 0px;
    --left-radius: 0px;
  }
  contain-play.selected {
    --bg-color: rgba(255, 80, 80, 0.75);
    --bg-hover-color: rgba(220, 0, 0, 0.75);
  }
</style>

<contain-build class:selected={$mode == 'build'}>
  <Button on:click={buildMode} style="min-width:80px">
    <icon>
      <IoIosBuild />
    </icon>
    Build
  </Button>
</contain-build>

<contain-play class:selected={$mode == 'play'}>
  <Button on:click={playMode} style="min-width:80px">
    <icon>
      <IoIosRocket />
    </icon>
    Play
  </Button>
</contain-play>

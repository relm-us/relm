<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { VideoIcon } from "video-mirror";
  import { setupState } from "~/stores/setupState";

  const onClick = () => {
    $setupState = "media";
  };
</script>

<CircleButton on:click={onClick}>
  <icon>
    <VideoIcon />
  </icon>
  <slot />
</CircleButton>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
</style>

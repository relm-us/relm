<script lang="ts">
  import Button from "~/ui/lib/Button";
  import { VideoIcon } from "video-mirror";
  import { setupState } from "~/stores/setupState";

  const onClick = () => {
    $setupState = "media";
  };
</script>

<Button on:click={onClick}>
  <icon>
    <VideoIcon />
  </icon>
  <slot />
</Button>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
</style>

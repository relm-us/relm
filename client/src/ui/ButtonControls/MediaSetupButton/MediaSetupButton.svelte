<script lang="ts">
  import Button from "~/ui/Button";
  import { VideoIcon } from "video-mirror";
  import { mediaSetupState } from "~/stores/mediaSetupState";

  const onClick = () => {
    $mediaSetupState = "setting";
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

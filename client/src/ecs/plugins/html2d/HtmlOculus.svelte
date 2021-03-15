<script>
  import { Video, localStream } from "video-mirror";

  // ignore warning about missing props
  $$props;
</script>

<oculus>
  <Video stream={$localStream} mirror={true} round={true} />
</oculus>

<style lang="scss">
  oculus {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border: 2px solid black;
    border-radius: 100%;
  }
</style>

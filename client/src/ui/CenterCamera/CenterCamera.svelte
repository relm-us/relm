<script>
  import { worldManager } from "~/world";
  import { centerCameraVisible } from "~/stores/centerCameraVisible";
  import Button from "~/ui/lib/Button";

  function onClick() {
    worldManager.camera.pan.set(0, 0, 0);
    centerCameraVisible.set(false);
  }
</script>

<r-center-cam>
  <div class="button">
    <Button on:click={onClick}>re-center camera</Button>
  </div>
</r-center-cam>

<style>
  r-center-cam {
    display: flex;
    flex-direction: column;
    align-items: center;

    position: absolute;
    z-index: 3;
    top: 70%;
    left: 50%;
    transform: translate(-50%);

    font-size: 32px;
    color: white;

    padding: 16px 32px 24px 32px;
    background: var(--background-transparent-gray, rgba(40, 40, 40, 0.9));
    border-radius: 5px;
  }

  .button {
    margin: 16px 0 12px 0;
  }
</style>

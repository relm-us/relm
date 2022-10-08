<script>
  import { worldManager } from "~/world";
  import { autoPause } from "~/stores/autoPause";
  import Button from "~/ui/lib/Button";

  import { _ } from "~/i18n";

  function onClick() {
    worldManager.camera.center();
  }
</script>

{#if $autoPause}
  <r-center-cam>
    <div class="button">
      <Button on:click={onClick}>{$_("CenterCamera.recenter")}</Button>
    </div>
  </r-center-cam>
{/if}

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

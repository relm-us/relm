<script>
  import Button from "~/ui/lib/Button";
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { playState } from "~/stores/playState";
  import { autoPause } from "~/stores/autoPause";
</script>

<message>
  <div class="paused">Paused</div>
  <div class="button">
    <Button on:click={() => ($playState = "playing")}>continue</Button>
  </div>
  <div class="toggle-auto-pause">
    <ToggleSwitch
      bind:enabled={$autoPause}
      labelOn="Autopause On"
      labelOff="Autopause Off"
    />
  </div>
</message>

<style>
  message {
    display: flex;
    flex-direction: column;
    align-items: center;

    position: absolute;
    z-index: 3;
    top: 40%;
    left: 50%;
    transform: translate(-50%);

    font-size: 6vw;
    color: white;

    padding: 16px 32px 24px 32px;
    background: rgba(40, 40, 40, 0.9);
    border-radius: 5px;
  }

  .button {
    margin: 16px 0 12px 0;
  }

  .toggle-auto-pause {
    margin-top: 16px;
    font-size: 12px;
  }
</style>

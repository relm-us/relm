<script>
  import Button from "~/ui/lib/Button";
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { playState } from "~/stores/playState";
  import { autoPause } from "~/stores/autoPause";
</script>

<message>
  <div>Paused</div>
  <Button on:click={() => ($playState = "playing")}>continue</Button>
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
  }

  .toggle-auto-pause {
    margin-top: 16px;
    font-size: 12px;
  }
</style>

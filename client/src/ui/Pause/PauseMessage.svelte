<script>
  import { fade } from "svelte/transition";

  import Button from "~/ui/lib/Button";
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { autoPause } from "~/stores/autoPause";
  import { worldManager } from "~/world";
</script>

<r-tint transition:fade>
  <r-message>
    <div class="paused">Paused</div>
    <div class="button">
      <Button on:click={() => worldManager.start()}>Continue</Button>
    </div>
    <div class="toggle-auto-pause">
      <ToggleSwitch
        enabled={$autoPause}
        labelOn="Autopause On"
        labelOff="Autopause Off"
        on:change={({ detail }) => ($autoPause = detail)}
      />
    </div>
  </r-message>
</r-tint>

<style>
  r-tint {
    display: flex;
    justify-content: center;
    align-items: center;

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: 200;

    background: rgba(0, 0, 0, 0.8);
  }
  r-message {
    display: flex;
    flex-direction: column;
    align-items: center;

    color: var(--background-gray, black);

    padding: 16px 48px;
    background: var(--foreground-white, white);
    border-radius: 5px;
  }

  r-message > * {
    margin: 16px 0;
  }

  .paused {
    font-size: 3rem;
    font-family: Garamond, "Times New Roman", Times, serif;
    font-weight: bold;
  }

  .button {
    --bg-color: var(--selected-red, red);
    --fg-color: white;
  }
  .button :global(button) {
    border: 1px solid #d67;
  }

  .toggle-auto-pause {
    font-size: 12px;
  }
</style>

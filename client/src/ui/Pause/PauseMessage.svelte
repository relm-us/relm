<script>
  import { fade } from "svelte/transition";

  import Button from "~/ui/lib/Button";
  import ToggleSwitch from "~/ui/lib/ToggleSwitch";
  import { autoPause } from "~/stores/autoPause";
  import { worldManager } from "~/world";

  function unpause() {
    worldManager.start();
  }
</script>

<r-tint transition:fade on:click={unpause}>
  <r-message on:click|stopPropagation>
    <div class="paused">Paused</div>
    <div class="button">
      <Button on:click={unpause}>Continue</Button>
    </div>
    <r-footer class="toggle-auto-pause" stlye="position:absolute">
      <ToggleSwitch
        enabled={$autoPause}
        labelOn="Autopause On"
        labelOff="Autopause Off"
        on:change={({ detail }) => ($autoPause = detail)}
      />
    </r-footer>
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
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;

    color: var(--background-gray, black);

    padding: 16px 48px;
    background: var(--foreground-white, white);
    border-radius: 5px;
  }

  r-message > div {
    margin: 12px 0;
  }
  r-message > div.button {
    margin-bottom: 60px;
  }

  r-footer {
    display: flex;
    justify-content: flex-end;

    position: absolute;
    width: 100%;
    bottom: 0;

    background: #bbb;
  }

  r-footer > :global(*) {
    /* Reduce size of the autopause toggle */
    transform: scale(0.65);
    transform-origin: right;
    margin: 4px 8px;
  }

  .paused {
    font-size: 3rem;
    font-family: Garamond, "Times New Roman", Times, serif;
    font-weight: bold;
  }

  .button {
    --bg-color: var(--selected-red, red);
    --bg-hover-color: var(--selected-red-hover, red);
    --fg-color: white;
  }
  .button :global(button) {
    border: 1px solid #d67;
  }

  .toggle-auto-pause {
    font-size: 12px;
  }
</style>

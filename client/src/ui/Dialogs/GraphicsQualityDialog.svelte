<script lang="ts">
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";

  import Dialog from "~/ui/lib/Dialog";
  import Slider from "~/ui/lib/Slider";

  import { graphicsQuality } from "~/stores/graphicsQuality";

  const dispatch = createEventDispatcher();

  function changeQuality({ detail: value }) {
    $graphicsQuality = Math.floor(value);
  }
</script>

<Dialog title={$_("RenderQualityDialog.title")} on:cancel>
  <r-interior>
    <r-slider>
      <Slider
        value={$graphicsQuality}
        range={[0, 4]}
        constrain={(value) => Math.floor(value + 0.5)}
        on:change={changeQuality}
      />
      <r-tick-marks>
        {#each [0, 1, 2, 3, 4] as quality}
          <r-tick>{$_(`RenderQualityDialog.${quality}`)}</r-tick>
        {/each}
      </r-tick-marks>
    </r-slider>
    <r-info>
      <r-level>{$_(`RenderQualityDialog.${$graphicsQuality}`)}</r-level>
      <r-desc>{$_(`RenderQualityDialog.${$graphicsQuality}_desc`)}</r-desc>
    </r-info>
  </r-interior>
</Dialog>

<style>
  r-interior {
    display: flex;
    flex-direction: column;
    width: 210px;
    color: var(--foreground-white);
  }

  r-info {
    display: block;
    margin: 16px 8px 8px 8px;
    height: 130px;
    overflow-y: auto;
  }

  r-slider {
    display: flex;
    flex-direction: column;

    border: 1px solid var(--orange);
    padding: 16px;
    border-radius: 12px;
  }
  r-tick-marks {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
  }

  r-level {
    display: block;
    font-size: 22px;
    margin: 8px 0;
    text-align: center;
  }
  r-desc {
    display: block;
    margin: 24px 0 8px 0;
    color: var(--foreground-gray);
  }
</style>

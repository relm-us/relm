<script lang="ts">
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";

  import Dialog from "~/ui/lib/Dialog";
  import Slider from "~/ui/lib/Slider";

  import { renderQuality } from "~/stores/renderQuality";

  const dispatch = createEventDispatcher();

  function changeQuality({ detail: value }) {
    $renderQuality = Math.floor(value);
  }
</script>

<Dialog title={$_("RenderQualityDialog.title")} on:cancel>
  <r-interior>
    <r-slider>
      <Slider
        value={$renderQuality}
        range={[0, 4]}
        constrain={(value) => Math.floor(value + 0.5)}
        on:change={changeQuality}
      />
      <r-tick-marks>
        <r-tick>{$_("RenderQualityDialog.lowest")}</r-tick>
        <r-tick>{$_("RenderQualityDialog.low")}</r-tick>
        <r-tick>{$_("RenderQualityDialog.medium")}</r-tick>
        <r-tick>{$_("RenderQualityDialog.high")}</r-tick>
        <r-tick>{$_("RenderQualityDialog.highest")}</r-tick>
      </r-tick-marks>
    </r-slider>
    <r-info>
      {#if $renderQuality === 0}
        <r-level>{$_("RenderQualityDialog.lowest")}</r-level>
        <r-desc>{$_("RenderQualityDialog.lowest_desc")}</r-desc>
      {:else if $renderQuality === 1}
        <r-level>{$_("RenderQualityDialog.low")}</r-level>
        <r-desc>{$_("RenderQualityDialog.low_desc")}</r-desc>
      {:else if $renderQuality === 2}
        <r-level>{$_("RenderQualityDialog.medium")}</r-level>
        <r-desc>{$_("RenderQualityDialog.medium_desc")}</r-desc>
      {:else if $renderQuality === 3}
        <r-level>{$_("RenderQualityDialog.high")}</r-level>
        <r-desc>{$_("RenderQualityDialog.high_desc")}</r-desc>
      {:else if $renderQuality === 4}
        <r-level>{$_("RenderQualityDialog.highest")}</r-level>
        <r-desc>{$_("RenderQualityDialog.highest_desc")}</r-desc>
      {/if}
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

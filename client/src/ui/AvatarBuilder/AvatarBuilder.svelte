<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Slider from "~/ui/Slider";
  import Color from "./Color.svelte";

  const dispatch = createEventDispatcher();

  function onSexChange({ detail }) {
    const value = detail[1];
    console.log("value", value);
  }

</script>

<div class="slider">
  Gender
  <Slider on:change={onSexChange} value={[0, 0.5]} single />
  <div class="label left">Male</div>
  <div class="label right">Female</div>
</div>

<div class="slider">
  Skintone
  <Slider on:change={onSexChange} value={[0, 0.5]} single />
  <div class="label r-1-5"><Color value="#ff0000" /></div>
  <div class="label r-2-5"><Color value="#ffffff" /></div>
  <div class="label r-3-5"><Color value="#ffffff" /></div>
  <div class="label r-4-5"><Color value="#ffffff" /></div>
  <div class="label r-5-5"><Color value="#ffffff" /></div>
</div>

<style lang="scss">
  .slider {
    width: 400px;
    position: relative;
  }

  .label {
    display: block;
    position: absolute;
  }

  // prettier-ignore
  @if 1 {
    .left { left: 0; }
    .right { right: 0; }
    .r-1-5 { left: 10%; }
    .r-2-5 { left: 30%; }
    .r-3-5 { left: 50%; }
    .r-4-5 { left: 70%; }
    .r-5-5 { left: 90%; }
  }

</style>

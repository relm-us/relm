<script lang="ts">
  import { Relm } from "~/stores/Relm";
  import Slider from "~/ui/Slider";
  import Color from "./Color.svelte";
  import type { HairType, TopType, BottomType, ShoeType } from "./appearance";
  import {
    skintones,
    hairtones,
    appearanceToCharacterTraits,
  } from "./appearance";

  let genderSlider = 0.5;
  let skintoneSlider = 0.5;
  let widthSlider = 0.5;
  let hairtoneSlider = 0.5;
  let beard = false;
  let belt = true;
  let hair: HairType = "short";
  let top: TopType = 2;
  let bottom: BottomType = 3;
  let shoes: ShoeType = 2;
  let topColor = "#ffffff";
  let bottomColor = "#9999bb";
  let beltColor = "#333333";
  let shoeColor = "#ffffff";

  $: {
    const traits = appearanceToCharacterTraits({
      genderSlider,
      skintoneSlider,
      widthSlider,
      hairtoneSlider,
      beard,
      belt,
      hair,
      top,
      bottom,
      shoes,
      topColor,
      bottomColor,
      beltColor,
      shoeColor,
    });
    $Relm.identities.me.set(traits);
  }

  function onChangeGender({ detail }) {
    genderSlider = detail[1];
  }

  function onChangeSkintone({ detail }) {
    skintoneSlider = detail[1];
  }

  function onChangeWidth({ detail }) {
    widthSlider = detail[1];
  }

  function onChangeHairtone({ detail }) {
    hairtoneSlider = detail[1];
  }

</script>

<container>
  <div class="slider">
    <div class="title center">Gender</div>
    <Slider on:change={onChangeGender} value={[0, genderSlider]} single />
    <div class="label left">Male</div>
    <div class="label right">Female</div>
  </div>

  <div class="slider">
    <div class="title center">Skintone</div>
    <Slider on:change={onChangeSkintone} value={[0, skintoneSlider]} single />
    <div class="label r-1-5"><Color value={skintones[0]} /></div>
    <div class="label r-2-5"><Color value={skintones[3]} /></div>
    <div class="label r-3-5"><Color value={skintones[6]} /></div>
    <div class="label r-4-5"><Color value={skintones[9]} /></div>
    <div class="label r-5-5"><Color value={skintones[11]} /></div>
  </div>

  <div class="slider">
    <div class="title center">Width</div>
    <Slider on:change={onChangeWidth} value={[0, widthSlider]} single />
    <div class="label left">Narrow</div>
    <div class="label right">Wide</div>
  </div>

  <div class="slider">
    <div class="title center">Hair Color</div>
    <Slider on:change={onChangeHairtone} value={[0, hairtoneSlider]} single />
    <div class="label r-1-5"><Color value={hairtones[0]} /></div>
    <div class="label r-2-5"><Color value={hairtones[1]} /></div>
    <div class="label r-3-5"><Color value={hairtones[2]} /></div>
    <div class="label r-4-5"><Color value={hairtones[3]} /></div>
    <div class="label r-5-5"><Color value={hairtones[4]} /></div>
  </div>
</container>

<style lang="scss">
  container {
    display: flex;
    flex-direction: column;
    margin-bottom: 32px;
  }
  .slider {
    width: 100%;
    position: relative;
    margin-bottom: 24px;
  }

  .label {
    position: absolute;
    color: var(--foreground-gray);
    font-size: 12px;
  }

  .title {
    color: var(--foreground-white);
  }

  // prettier-ignore
  @if 1 {
    .left { left: 0; }
    .right { right: 0; }
    .center { text-align: center; }
    .r-1-5 { left: 10%; }
    .r-2-5 { left: 30%; }
    .r-3-5 { left: 50%; }
    .r-4-5 { left: 70%; }
    .r-5-5 { left: 90%; }
  }

</style>

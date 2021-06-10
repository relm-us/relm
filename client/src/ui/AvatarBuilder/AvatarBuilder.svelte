<script lang="ts">
  import { Relm } from "~/stores/Relm";
  import Slider from "~/ui/Slider";
  import Color from "./Color.svelte";
  import ColorPick from "./ColorPick.svelte";
  import Choice from "./Choice.svelte";
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

  const onClickHairStyle = (style: HairType) => () => {
    hair = style;
  };

  const onClickTopStyle = (style: TopType) => () => {
    top = style;
  };

  const onClickBottomStyle = (style: BottomType) => () => {
    bottom = style;
  };

  const onClickShoeStyle = (style: ShoeType) => () => {
    shoes = style;
  };

  const onClickBeltStyle = (style: boolean) => () => {
    belt = style;
  };

  function onPickTopColor({ detail }) {
    const cssColor = detail.indexOf("#") === 0 ? detail.slice(0, 7) : detail;
    console.log("onPickTopColor", cssColor);
    topColor = cssColor;
  }

  function onPickBottomColor({ detail }) {
    const cssColor = detail.indexOf("#") === 0 ? detail.slice(0, 7) : detail;
    bottomColor = cssColor;
  }

  function onPickShoeColor({ detail }) {
    const cssColor = detail.indexOf("#") === 0 ? detail.slice(0, 7) : detail;
    shoeColor = cssColor;
  }

  function onPickBeltColor({ detail }) {
    const cssColor = detail.indexOf("#") === 0 ? detail.slice(0, 7) : detail;
    beltColor = cssColor;
  }

</script>

<container>
  <div class="section">
    <div class="title center">Gender</div>
    <Slider on:change={onChangeGender} value={[0, genderSlider]} single />
    <div class="row between">
      <div class="label">Male</div>
      <div class="label">Female</div>
    </div>
  </div>

  <div class="section">
    <div class="title center">Skintone</div>
    <Slider on:change={onChangeSkintone} value={[0, skintoneSlider]} single />
    <div class="row">
      <Color value={skintones[0]} />
      <Color value={skintones[3]} />
      <Color value={skintones[6]} />
      <Color value={skintones[9]} />
      <Color value={skintones[11]} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Width</div>
    <Slider on:change={onChangeWidth} value={[0, widthSlider]} single />
    <div class="row between">
      <div class="label">Narrow</div>
      <div class="label">Wide</div>
    </div>
  </div>

  <div class="section">
    <div class="title center">Hair Color</div>
    <Slider on:change={onChangeHairtone} value={[0, hairtoneSlider]} single />
    <div class="row">
      <Color value={hairtones[0]} />
      <Color value={hairtones[1]} />
      <Color value={hairtones[2]} />
      <Color value={hairtones[3]} />
      <Color value={hairtones[4]} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Hair Style</div>
    <div class="row evenly">
      <Choice src="/icons/hair-01.png" on:click={onClickHairStyle("bald")} />
      <Choice src="/icons/hair-02.png" on:click={onClickHairStyle("short")} />
      <Choice src="/icons/hair-03.png" on:click={onClickHairStyle("mid")} />
      <Choice src="/icons/hair-04.png" on:click={onClickHairStyle("long")} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Shirt</div>
    <div class="row evenly">
      <ColorPick on:change={onPickTopColor} />
      <Choice src="/icons/shirt-01.png" on:click={onClickTopStyle(1)} />
      <Choice src="/icons/shirt-02.png" on:click={onClickTopStyle(2)} />
      <Choice src="/icons/shirt-03.png" on:click={onClickTopStyle(3)} />
      <Choice src="/icons/shirt-04.png" on:click={onClickTopStyle(4)} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Pants</div>
    <div class="row evenly">
      <ColorPick on:change={onPickBottomColor} />
      <Choice src="/icons/pants-01.png" on:click={onClickBottomStyle(0)} />
      <Choice src="/icons/pants-02.png" on:click={onClickBottomStyle(1)} />
      <Choice src="/icons/pants-03.png" on:click={onClickBottomStyle(2)} />
      <Choice src="/icons/pants-04.png" on:click={onClickBottomStyle(3)} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Shoes</div>
    <div class="row evenly">
      <ColorPick on:change={onPickShoeColor} />
      <Choice src="/icons/shoes-01.png" on:click={onClickShoeStyle(0)} />
      <Choice src="/icons/shoes-02.png" on:click={onClickShoeStyle(1)} />
      <Choice src="/icons/shoes-03.png" on:click={onClickShoeStyle(2)} />
      <Choice src="/icons/shoes-04.png" on:click={onClickShoeStyle(3)} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Belt</div>
    <div class="row evenly">
      <ColorPick on:change={onPickBeltColor} />
      <Choice src="/icons/shirt-01.png" on:click={onClickBeltStyle(false)} />
      <Choice src="/icons/shirt-02.png" on:click={onClickBeltStyle(true)} />
    </div>
  </div>
</container>

<style lang="scss">
  container {
    display: flex;
    flex-direction: column;
    margin-bottom: 32px;
  }

  .section {
    width: 100%;
  }

  .row {
    width: 100%;
    display: flex;
    justify-content: space-around;
  }
  .row.evenly {
    justify-content: space-evenly;
  }
  .row.between {
    justify-content: space-between;
  }

  .label {
    color: var(--foreground-gray);
    font-size: 12px;
  }

  .title {
    color: var(--foreground-white);
    margin-top: 8px;
    margin-bottom: 6px;
  }

  .center {
    text-align: center;
  }

</style>

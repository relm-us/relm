<script lang="ts">
  import { Relm } from "~/stores/Relm";
  import Slider from "~/ui/Slider";
  import Color from "./Color.svelte";
  import ColorPick from "./ColorPick.svelte";
  import Choice from "./Choice.svelte";
  import type { HairType, TopType, BottomType, ShoeType } from "./appearance";
  import {
    skinColors,
    hairColors,
    appearanceToCharacterTraits,
  } from "./appearance";
  import ToggleSwitch from "~/ui/ToggleSwitch";

  let genderSlider = 0.5;
  let widthSlider = 0.25;
  let beard = false;
  let belt = true;
  let hair: HairType = "short";
  let top: TopType = 2;
  let bottom: BottomType = 3;
  let shoes: ShoeType = 2;
  let skinColor = skinColors[2];
  let hairColor = hairColors[2];
  let topColor = "#ffffff";
  let bottomColor = "#9999bb";
  let beltColor = "#333333";
  let shoeColor = "#ffffff";

  $: {
    const traits = appearanceToCharacterTraits({
      genderSlider,
      widthSlider,
      beard,
      belt,
      hair,
      top,
      bottom,
      shoes,
      skinColor,
      hairColor,
      topColor: topColor.indexOf("#") === 0 ? topColor.slice(0, 7) : topColor,
      bottomColor:
        bottomColor.indexOf("#") === 0 ? bottomColor.slice(0, 7) : bottomColor,
      beltColor:
        beltColor.indexOf("#") === 0 ? beltColor.slice(0, 7) : beltColor,
      shoeColor:
        shoeColor.indexOf("#") === 0 ? shoeColor.slice(0, 7) : shoeColor,
    });
    $Relm.identities.me.set(traits);
  }

  function onSlideGender({ detail }) {
    genderSlider = detail[1];
  }

  function onSlideWidth({ detail }) {
    widthSlider = detail[1];
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

  const setSkinColor = (color: string) => () => {
    skinColor = color;
  };

  const setHairColor = (color: string) => () => {
    hairColor = color;
  };

</script>

<container>
  <div class="section">
    <div class="title center">Gender:</div>
    <Slider on:change={onSlideGender} value={[0, genderSlider]} single />
    <div class="row between">
      <div class="label">Male</div>
      <div class="label">Female</div>
    </div>
  </div>

  <div class="section">
    <div class="title center">Width:</div>
    <Slider on:change={onSlideWidth} value={[0, widthSlider]} single />
    <div class="row between">
      <div class="label">Narrow</div>
      <div class="label">Wide</div>
    </div>
  </div>

  <div class="section">
    <div class="title center">Skintone:</div>
    <div class="row">
      <Color
        value={skinColors[0]}
        selected={skinColor === skinColors[0]}
        on:click={setSkinColor(skinColors[0])}
      />
      <Color
        value={skinColors[1]}
        selected={skinColor === skinColors[1]}
        on:click={setSkinColor(skinColors[1])}
      />
      <Color
        value={skinColors[2]}
        selected={skinColor === skinColors[2]}
        on:click={setSkinColor(skinColors[2])}
      />
      <Color
        value={skinColors[3]}
        selected={skinColor === skinColors[3]}
        on:click={setSkinColor(skinColors[3])}
      />
      <Color
        value={skinColors[4]}
        selected={skinColor === skinColors[4]}
        on:click={setSkinColor(skinColors[4])}
      />
    </div>
  </div>

  <div class="section">
    <div class="title center">Hair:</div>
    <div class="row evenly space-above">
      <Choice
        src="/icons/none.png"
        selected={hair === "bald"}
        on:click={onClickHairStyle("bald")}
      />
      <Choice
        src="/icons/hair-02.png"
        selected={hair === "short"}
        on:click={onClickHairStyle("short")}
      />
      <Choice
        src="/icons/hair-03.png"
        selected={hair === "mid"}
        on:click={onClickHairStyle("mid")}
      />
      <Choice
        src="/icons/hair-04.png"
        selected={hair === "long"}
        on:click={onClickHairStyle("long")}
      />
    </div>
    <div class="row space-above">
      <Color
        value={hairColors[0]}
        selected={hairColor === hairColors[0]}
        on:click={setHairColor(hairColors[0])}
      />
      <Color
        value={hairColors[1]}
        selected={hairColor === hairColors[1]}
        on:click={setHairColor(hairColors[1])}
      />
      <Color
        value={hairColors[2]}
        selected={hairColor === hairColors[2]}
        on:click={setHairColor(hairColors[2])}
      />
      <Color
        value={hairColors[3]}
        selected={hairColor === hairColors[3]}
        on:click={setHairColor(hairColors[3])}
      />
      <Color
        value={hairColors[4]}
        selected={hairColor === hairColors[4]}
        on:click={setHairColor(hairColors[4])}
      />
    </div>
  </div>

  <div class="section">
    <div class="title center">Shirt:</div>
    <div class="row evenly">
      <Choice
        src="/icons/shirt-01.png"
        selected={top === 1}
        on:click={onClickTopStyle(1)}
      />
      <Choice
        src="/icons/shirt-02.png"
        selected={top === 2}
        on:click={onClickTopStyle(2)}
      />
      <Choice
        src="/icons/shirt-03.png"
        selected={top === 3}
        on:click={onClickTopStyle(3)}
      />
      <Choice
        src="/icons/shirt-04.png"
        selected={top === 4}
        on:click={onClickTopStyle(4)}
      />
      <ColorPick bind:value={topColor} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Pants:</div>
    <div class="row evenly">
      <Choice
        src="/icons/pants-01.png"
        selected={bottom === 0}
        on:click={onClickBottomStyle(0)}
      />
      <Choice
        src="/icons/pants-02.png"
        selected={bottom === 1}
        on:click={onClickBottomStyle(1)}
      />
      <Choice
        src="/icons/pants-03.png"
        selected={bottom === 2}
        on:click={onClickBottomStyle(2)}
      />
      <Choice
        src="/icons/pants-04.png"
        selected={bottom === 3}
        on:click={onClickBottomStyle(3)}
      />
      <ColorPick bind:value={bottomColor} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Shoes:</div>
    <div class="row evenly">
      <Choice
        src="/icons/shoes-01.png"
        selected={shoes === 1}
        on:click={onClickShoeStyle(1)}
      />
      <Choice
        src="/icons/shoes-02.png"
        selected={shoes === 2}
        on:click={onClickShoeStyle(2)}
      />
      <Choice
        src="/icons/shoes-03.png"
        selected={shoes === 3}
        on:click={onClickShoeStyle(3)}
      />
      <Choice
        src="/icons/shoes-04.png"
        selected={shoes === 4}
        on:click={onClickShoeStyle(4)}
      />
      <ColorPick bind:value={shoeColor} />
    </div>
  </div>

  <div class="section">
    <div class="title center">Belt:</div>
    <div class="row evenly">
      <ToggleSwitch bind:enabled={belt} />
      {#if belt}
        <ColorPick bind:value={beltColor} />
      {:else}
        <div style="width:24px;height:24px" />
      {/if}
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
  .space-above {
    margin-top: 8px;
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

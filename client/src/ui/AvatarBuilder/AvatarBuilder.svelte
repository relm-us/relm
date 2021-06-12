<script lang="ts">
  import { Relm } from "~/stores/Relm";
  import Slider from "~/ui/Slider";
  import Color from "./Color.svelte";
  import ColorPick from "./ColorPick.svelte";
  import Choice from "./Choice.svelte";
  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";
  import { skinColors, hairColors } from "~/identity/appearance";
  import type {
    HairType,
    TopType,
    BottomType,
    ShoeType,
  } from "~/identity/types";
  import ToggleSwitch from "~/ui/ToggleSwitch";
  import Section from "./Section.svelte";

  export let genderSlider: number;
  export let widthSlider: number;
  export let beard: boolean;
  export let belt: boolean;
  export let hair: HairType;
  export let top: TopType;
  export let bottom: BottomType;
  export let shoes: ShoeType;
  export let skinColor: string;
  export let hairColor: string;
  export let topColor: string;
  export let bottomColor: string;
  export let beltColor: string;
  export let shoeColor: string;

  $: {
    const appearance = {
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
    };

    $Relm.identities.me.set({ appearance });
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

  const setSkinColor = (color: string) => () => {
    skinColor = color;
  };

  const setHairColor = (color: string) => () => {
    hairColor = color;
  };

</script>

<container>
  <h1>
    <icon class="upper-right" on:click><IoIosClose /></icon>
    Avatar
  </h1>
  <Section name="Gender">
    <Slider on:change={onSlideGender} value={[0, genderSlider]} single />
    <div class="row between">
      <div class="label">Male</div>
      <div class="label">Female</div>
    </div>
  </Section>

  <Section name="Body">
    <Slider on:change={onSlideWidth} value={[0, widthSlider]} single />
    <div class="row between">
      <div class="label">Narrow</div>
      <div class="label">Wide</div>
    </div>
  </Section>

  <Section name="Skintone">
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
  </Section>

  <Section name="Hair">
    <div class="row evenly">
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
  </Section>

  <Section name="Shirt">
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
  </Section>

  <Section name="Pants">
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
  </Section>

  <Section name="Shoes">
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
  </Section>

  <Section name="Belt" last={true}>
    <div class="row evenly">
      <ToggleSwitch bind:enabled={belt} />
      {#if belt}
        <ColorPick bind:value={beltColor} />
      {:else}
        <div style="width:26px;height:26px" />
      {/if}
    </div>
  </Section>
</container>

<style lang="scss">
  h1 {
    position: relative;
    font-size: 20px;
    color: var(--foreground-white);
    text-align: center;
    margin: 0px 0 28px 0;
  }

  icon {
    display: block;
    width: 32px;
    height: 32px;

    color: white;
  }
  icon.upper-right {
    position: absolute;
    top: -2px;
    right: 8px;
  }
  container {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--foreground-dark-gray);

    padding: 12px 0 0 0;
    border-radius: 8px;
    background-color: var(--background-gray);

    overflow-y: auto;

    --sliderPrimary: #8de66a;
    --sliderSecondary: #8de66a;
  }

  .row {
    width: 100%;
    display: flex;
    justify-content: space-around;
  }
  .row :global(lbl) {
    color: var(--foreground-white);
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
    margin-left: 8px;
    margin-right: 8px;
  }

</style>

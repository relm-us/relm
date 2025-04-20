<script lang="ts">
import PageOverlay from "~/ui/lib/PageOverlay"
import { _ } from "~/i18n"

import preset0 from "./presets/avatar_0.png"
import preset1 from "./presets/avatar_1.png"
import preset2 from "./presets/avatar_2.png"
import preset3 from "./presets/avatar_3.png"
import preset4 from "./presets/avatar_4.png"
import preset5 from "./presets/avatar_5.png"

export let dispatch

const presets = {
  0: {
    image: preset0,
    appearance: {
      genderSlider: 0,
      widthSlider: 0.3086952541185462,
      beard: false,
      belt: false,
      hair: "short",
      top: 2,
      bottom: 3,
      shoes: 3,
      skinColor: "#947159",
      fantasySkinColor: "#947159",
      hairColor: "#f1bbdf",
      topColor: "#0a545e",
      bottomColor: "#1e2022",
      beltColor: "#7a6f38",
      shoeColor: "#73e4f3",
    },
  },
  1: {
    image: preset1,
    appearance: {
      genderSlider: 0.39402173913043476,
      widthSlider: 0,
      beard: false,
      belt: true,
      hair: "short",
      top: 2,
      bottom: 3,
      shoes: 4,
      skinColor: "#d0b4a8",
      fantasySkinColor: "#d0b4a8",
      hairColor: "#aa9d90",
      topColor: "#6a8e4d",
      bottomColor: "#141313",
      beltColor: "#573e27",
      shoeColor: "#573e27",
    },
  },
  2: {
    image: preset2,
    appearance: {
      genderSlider: 0.6500005307404891,
      widthSlider: 0.47500013268512226,
      beard: false,
      belt: false,
      hair: "mid",
      top: 3,
      bottom: 3,
      shoes: 4,
      skinColor: "#c2a482",
      fantasySkinColor: "#c2a482",
      hairColor: "#9a3300",
      topColor: "#155920",
      bottomColor: "#fbe202",
      beltColor: "#121212",
      shoeColor: "#b7a18d",
    },
  },
  3: {
    image: preset3,
    appearance: {
      genderSlider: 1,
      widthSlider: 0.7532607368800951,
      beard: false,
      belt: true,
      hair: "short",
      top: 1,
      bottom: 0,
      shoes: 1,
      skinColor: "#2c1e0b",
      fantasySkinColor: "#2c1e0b",
      hairColor: "#0a0a0a",
      topColor: "#c11869",
      bottomColor: "#7472fa",
      beltColor: "#7472fa",
      shoeColor: "#b959f5",
    },
  },
  4: {
    image: preset4,
    appearance: {
      genderSlider: 0.01956574813179348,
      widthSlider: 0.697826219641644,
      beard: false,
      belt: false,
      hair: "mid",
      top: 2,
      bottom: 1,
      shoes: 3,
      skinColor: "#855a32",
      fantasySkinColor: "#855a32",
      hairColor: "#3d2107",
      topColor: "#515357",
      bottomColor: "#0d142b",
      beltColor: "#080705",
      shoeColor: "#b9ebf2",
    },
  },
  5: {
    image: preset5,
    appearance: {
      genderSlider: 0,
      widthSlider: 0.1793478260869565,
      beard: false,
      belt: true,
      hair: "short",
      top: 4,
      bottom: 3,
      shoes: 3,
      skinColor: "#57351d",
      fantasySkinColor: "#57351d",
      hairColor: "#20150b",
      topColor: "#fbfbfb",
      bottomColor: "#6f6c58",
      beltColor: "#513317",
      shoeColor: "#513317",
    },
  },
}

const pick = (presetId) => () => {
  dispatch({
    id: "didSetUpAvatar",
    appearance: presets[presetId].appearance,
  })
}
</script>

<PageOverlay zIndex={4} justify="center">
  <r-container>
    <h1>{$_("AvatarBuilder.choose_yours")}</h1>
    <r-avatars>
      {#each Object.entries(presets) as [id, preset], i}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <button class="avatar-btn" on:click={pick(id)}>
          <img src={preset.image} alt="Avatar {id}" />
        </button>
      {/each}
    </r-avatars>
    <div class="spacer" />
    <r-note>
      {$_("AvatarBuilder.customize_later")}
    </r-note>
  </r-container>
</PageOverlay>

<style>
  h1 {
    font-size: 32px;
    color: rgba(200, 200, 200, 1);
  }

  r-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 5vh;
    margin-bottom: 5vh;
  }

  r-avatars {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    max-width: 500px;
  }

  .avatar-btn {
    display: flex;
    margin: 8px;
    padding: 0;
    border: 0;
    background: none;
  }

  .avatar-btn img {
    object-fit: cover;
    height: 225px;
    border: 2px solid transparent;
    border-radius: 5px;
  }

  .avatar-btn img:hover {
    border: 2px solid var(--selected-red);
  }

  r-note {
    color: var(--foreground-white);
  }

  .spacer {
    margin-top: 16px;
  }
</style>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Relm } from "~/stores/Relm";
  import { askAvatarSetup } from "~/stores/askAvatarSetup";
  import FullScreen from "~/ui/FullScreen";

  const dispatch = createEventDispatcher();

  let choice;

  const pick = (value) => () => {
    let charColors;
    let charMorphs;
    if (value === "male") {
      charColors = {
        "skin": ["#c58c85", 0.9],
        "beard": ["#c58c85", 0.9],
        "hair": ["#6e6057", 0.9],
        "top-01": ["#fbfbfb", 0.9],
        "top-02": ["#fbfbfb", 0.9],
        "top-03": ["#fbfbfb", 0.9],
        "top-04": ["#fbfbfb", 0.9],
        "belt": ["#7a6f38", 0.9],
        "pants-01": ["#2e2b19", 0.9],
        "pants-02": ["#2e2b19", 0.9],
        "pants-03": ["#2e2b19", 0.9],
        "pants-04": ["#2e2b19", 0.9],
        "shoes-01": ["#080705", 0.9],
        "shoes-02": ["#080705", 0.9],
        "shoes-03": ["#080705", 0.9],
      };
      charMorphs = { "gender": 0, "wide": 0, "hair": 0, "hair-02": 1 };
    } else if (value === "female") {
      charColors = {
        "skin": ["#c58c85", 0.9],
        "beard": ["#c58c85", 0.9],
        "hair": ["#6e6057", 0.9],
        "top-01": ["#fbfbfb", 0.9],
        "top-02": ["#fbfbfb", 0.9],
        "top-03": ["#fbfbfb", 0.9],
        "top-04": ["#fbfbfb", 0.9],
        "belt": ["#7a6f38", 0.9],
        "pants-01": ["#2e2b19", 0.9],
        "pants-02": ["#2e2b19", 0.9],
        "pants-03": ["#2e2b19", 0.9],
        "pants-04": ["#2e2b19", 0.9],
        "shoes-01": ["#080705", 0.9],
        "shoes-02": ["#080705", 0.9],
        "shoes-03": ["#080705", 0.9],
      };
      charMorphs = { "gender": 1, "wide": 0, "hair": 0.5, "hair-02": 1 };
    } else {
      console.warn("Avatar selection invalid:", value);
    }

    if (charColors && charMorphs) {
      $Relm.identities.me.set({ charColors, charMorphs });
    }

    $askAvatarSetup = false;
    dispatch("done");
  };

</script>

<FullScreen zIndex={4} justify="center">
  <container>
    <h1>Choose Your Avatar</h1>
    <avatars>
      <avatar on:click={pick("male")}>
        <img src="/humanoid-preset-male.png" alt="male" />
      </avatar>
      <avatar on:click={pick("female")}>
        <img src="/humanoid-preset-female.png" alt="female" />
      </avatar>
    </avatars>
    <div class="spacer" />
    <note>(you can customize this later)</note>
  </container>
</FullScreen>

<style>
  h1 {
    font-size: 32px;
    color: rgba(200, 200, 200, 1);
  }

  container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 5vh;
  }

  avatars {
    display: flex;
    justify-content: center;
  }

  avatar {
    display: block;
    width: 150px;
    height: 225px;
    margin: 8px;
  }

  avatar img {
    object-fit: cover;
    width: 150px;
    height: 225px;
    border: 2px solid transparent;
    border-radius: 5px;
  }

  avatar img:hover {
    border: 2px solid var(--selected-red);
  }

  .spacer {
    margin-top: 16px;
  }

  note {
    color: var(--foreground-white);
  }

</style>

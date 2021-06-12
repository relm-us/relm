<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Relm } from "~/stores/Relm";
  import { askAvatarSetup } from "~/stores/askAvatarSetup";
  import FullScreen from "~/ui/FullScreen";
  import { getDefaultAppearance } from "~/identity/appearance";
  import type { BinaryGender } from "~/identity/types";

  const dispatch = createEventDispatcher();

  const pick = (gender: BinaryGender) => () => {
    const appearance = getDefaultAppearance(gender);

    $Relm.identities.me.set({ appearance });

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

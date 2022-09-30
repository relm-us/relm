<script lang="ts">
  import type { BinaryGender } from "relm-common";

  import PageOverlay from "~/ui/lib/PageOverlay";
  import { getDefaultAppearance } from "~/identity/Avatar/appearance";
  import { _ } from "~/i18n";

  import malePng from "./presets/male.png";
  import femalePng from "./presets/female.png";

  export let dispatch;

  const pick = (gender: BinaryGender) => () => {
    const appearance = getDefaultAppearance(gender);
    dispatch({ id: "didSetUpAvatar", appearance });
  };
</script>

<PageOverlay zIndex={4} justify="center">
  <container>
    <h1>{$_("AvatarBuilder.choose_yours")}</h1>
    <avatars>
      <avatar on:click={pick("male")}>
        <img src={malePng} alt="male" />
      </avatar>
      <avatar on:click={pick("female")}>
        <img src={femalePng} alt="female" />
      </avatar>
    </avatars>
    <div class="spacer" />
    <note>
      {$_("AvatarBuilder.customize_later")}
    </note>
  </container>
</PageOverlay>

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

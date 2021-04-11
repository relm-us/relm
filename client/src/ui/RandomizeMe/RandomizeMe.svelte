<script lang="ts">
  import Button from "../Button";
  import IoIosHappy from "svelte-icons/io/IoIosHappy.svelte";
  import { getCharacterFacemaps } from "~/identity/colors";
  import { randomMorphInfluences } from "~/identity/morphs";
  import { Relm } from "~/stores/Relm";

  const BEARD_POPULARITY = 0.7;

  const onClick = () => {
    const avatar = $Relm.identities.me;
    avatar.sharedFields.update((fields) => {
      const hasHair = true; // TODO: Math.random() >= 0.1; // most people have hair
      const charMorphs = randomMorphInfluences();
      if (!hasHair) Object.assign(charMorphs, { "hair": 0, "hair-02": 0 });
      const charColors = getCharacterFacemaps({
        beard: charMorphs.gender < 0.5 && Math.random() >= BEARD_POPULARITY,
        hair: hasHair,
      });
      return Object.assign(fields, { charColors, charMorphs });
    });
  };
</script>

<Button on:click={onClick}>
  <icon>
    <IoIosHappy />
  </icon>
  <slot />
</Button>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
</style>

<script lang="ts">
  import Button from "../Button";
  import IoIosHappy from "svelte-icons/io/IoIosHappy.svelte";
  import { getCharacterFacemaps } from "~/identity/colors";
  import { randomMorphInfluences } from "~/identity/morphs";
  import { Relm } from "~/stores/Relm";

  const onClick = () => {
    const avatar = $Relm.identities.me;
    avatar.sharedFields.update((fields) =>
      Object.assign(fields, {
        charColors: getCharacterFacemaps(),
        charMorphs: randomMorphInfluences(),
      })
    );
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

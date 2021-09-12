<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import { setupState } from "~/stores/setupState";
  import SettingsIcon from "svelte-icons/io/IoMdSettings.svelte";

  const onClick = () => {
    $setupState = "media";
  };
</script>

<CircleButton on:click={onClick}>
  <icon>
    <SettingsIcon />
  </icon>
  <slot />
</CircleButton>

<style>
  icon {
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto;
  }
</style>

<script lang="ts">
  export let width: number;
  export let height: number;

  let profileVisible = false;

  const toggleProfile = () => {
    profileVisible = !profileVisible;
  };
</script>

<style>
  div {
    width: var(--width);
    height: var(--height);
    overflow: hidden;

    border-radius: 100%;
    box-shadow: inset 0px 0px 0px 4px rgba(0, 0, 0, 0.75);
  }
  img {
    display: block;
    object-fit: contain;
  }
  whitebox {
    border-radius: 100%;
    box-shadow: inset 0px 0px 0px 4px rgba(0, 0, 0, 0.75);
    display: block;
    background-color: white;
    width: var(--width);
    height: var(--height);
  }
</style>

<div
  style="--width: {width}px; --height: {height}px"
  on:mousedown|stopPropagation={toggleProfile}>
  {#if profileVisible}
    <img {width} {height} src="/default-profile.jpg" alt="Head" />
  {:else}
    <whitebox />
  {/if}
</div>

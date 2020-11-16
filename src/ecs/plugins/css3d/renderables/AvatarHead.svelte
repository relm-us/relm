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

    border-radius: 100%;
    box-shadow: inset 0px 0px 0px 4px rgba(0, 0, 0, 0.75);
  }
  img {
    display: block;
    object-fit: contain;
  }
</style>

<div
  style="--width: {width}px; --height: {height}px"
  on:mousedown|stopPropagation={toggleProfile}>
  {#if profileVisible}
    <img {width} {height} src="/default-profile.jpg" alt="Head" />
  {/if}
</div>

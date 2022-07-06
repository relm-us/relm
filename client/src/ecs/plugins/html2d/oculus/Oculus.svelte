<script lang="ts">
  export let color: string;
</script>

<oculus style="--oculus-border-color: {color}" on:click>
  <slot />
</oculus>

<style>
  oculus {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
    box-shadow: 0 0 5px var(--oculus-border-color, #cccccc);
    background-color: #959595;

    overflow: hidden;
    border: 2px solid var(--oculus-border-color, #cccccc);
    border-radius: 100%;

    /* Safari needs this in order to clip the video as a circle */
    transform: translate3d(-2px, 0, 0);
  }

  oculus::after {
    content: " ";
    display: block;
    width: 100%;
    height: 100%;
    background-image: var(--background-image);
    position: absolute;
    background-size: 100%;
    opacity: 0.45;
  }
</style>

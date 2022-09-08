<script lang="ts">
  export let width: number = 120;
</script>

<r-pop-context style="--width: {width}px">
  <slot />
</r-pop-context>

<style>
  /* Taken from: https://sharkcoder.com/visual/shapes */

  r-pop-context {
    display: block;

    position: relative;
    width: var(--width);
    padding: 8px 10px 8px 8px;
    border-radius: 10px;

    color: var(--foreground-white, white);
    background: var(--background-transparent-gray, black);
  }

  r-pop-context::after {
    content: "";

    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 0;

    border: 13px solid transparent;
    border-top-color: var(--background-transparent-gray, black);
    border-bottom: 0;

    margin-left: -13px;
    margin-bottom: -13px;
  }
</style>

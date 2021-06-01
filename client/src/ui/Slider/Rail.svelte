<script>
  export let value;

</script>

<div class="rail">
  <div
    class="selected"
    style="left: {value[0] * 100}%; right: {(1 - value[1]) * 100}%;"
  />
  <slot />
</div>

<style>
  .rail {
    position: relative;
    height: 2px;
    background: var(--sliderSecondary);
  }

  .selected {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: var(--sliderPrimary);
  }

</style>

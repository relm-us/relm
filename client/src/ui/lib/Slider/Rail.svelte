<r-rail>
  <r-selected />
  <slot />
</r-rail>

<style>
  r-rail {
    display: block;

    position: relative;
    height: 2px;

    background: var(--sliderSecondary);
  }

  r-selected {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: var(--sliderPrimary);
  }
</style>

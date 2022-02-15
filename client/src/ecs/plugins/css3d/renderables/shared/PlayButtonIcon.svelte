<script lang="ts">
  export let active: boolean = false;
</script>

<div class="icon" aria-label="Play">
  <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%">
    <path
      class="play-button"
      class:active
      d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
      fill="#f00"
    />
    <path d="M 45,24 27,14 27,34" fill="#fff" />
  </svg>
</div>

<style>
  .icon {
    border: none;
    background-color: transparent;
    padding: 0;
    position: absolute;
    left: 50%;
    top: 50%;
    width: 68px;
    height: 48px;
    margin-left: -34px;
    margin-top: -24px;
    -webkit-transition: opacity 0.25s cubic-bezier(0, 0, 0.2, 1);
    transition: opacity 0.25s cubic-bezier(0, 0, 0.2, 1);
    z-index: 1;
    cursor: pointer;
  }
  .play-button {
    -webkit-transition: fill 0.1s cubic-bezier(0.4, 0, 1, 1),
      fill-opacity 0.1s cubic-bezier(0.4, 0, 1, 1);
    transition: fill 0.1s cubic-bezier(0.4, 0, 1, 1),
      fill-opacity 0.1s cubic-bezier(0.4, 0, 1, 1);
    fill: #212121;
    fill-opacity: 0.8;
  }
  .play-button.active {
    -webkit-transition: fill 0.1s cubic-bezier(0, 0, 0.2, 1),
      fill-opacity 0.1s cubic-bezier(0, 0, 0.2, 1);
    transition: fill 0.1s cubic-bezier(0, 0, 0.2, 1),
      fill-opacity 0.1s cubic-bezier(0, 0, 0.2, 1);
    fill: #f00;
    fill-opacity: 1;
  }
</style>

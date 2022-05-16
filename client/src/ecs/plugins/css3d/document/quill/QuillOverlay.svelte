<script lang="ts">
  export let cloudy: boolean = false;
</script>

<r-overlay class:cloudy on:click />

<style>
  r-overlay {
    position: absolute;
    z-index: 2;

    left: 0;
    top: 0;

    width: 100%;
    height: 100%;
  }

  .cloudy {
    opacity: 0.5;
    background-color: white;
  }
</style>

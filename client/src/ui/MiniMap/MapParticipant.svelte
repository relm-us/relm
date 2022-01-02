<script lang="ts">
  export let x: number;
  export let y: number;
  export let color = "#efefef";
</script>

<r-map-participant style="left: {x}px; top: {y}px; background-color: {color}" />

<style>
  r-map-participant {
    display: block;
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: 100%;
    transform: translate(-50%, -50%);
  }
</style>

<script lang="ts">
  import { Color, HSL } from "three";

  export let name: string = "";
  export let color: string;

  let fgColor = "black";

  $: {
    // Choose a foreground text color with enough contrast
    // to show up, regardless of background color
    let hsl: HSL = { h: 0, s: 0, l: 0 };
    new Color(color).getHSL(hsl).l;
    if (hsl.l < 0.5) fgColor = "white";
    else fgColor = "black";
  }
</script>

<div class="name" style="--name-bg-color: {color}; --name-color: {fgColor}">
  <span>{name ? name : ""}</span>
</div>

<style>
  div.name {
    position: absolute;
    bottom: -12px;

    background: var(--name-bg-color, white);
    color: var(--name-color, black);

    max-width: 120px;
    height: 20px;
    text-align: center;
    border-radius: 12px;
    white-space: nowrap;
    padding: 0 6px;
    left: 50%;
    transform: translateX(-50%);
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

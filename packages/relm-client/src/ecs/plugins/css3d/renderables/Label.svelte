<script lang="ts">
  export let width: number;
  export let height: number;
  export let fontSize: number;
  export let text: string;
  export let fontColor: string;
  export let bgColor: string;

  // ignore warning about missing props
  $$props;
</script>

<!-- <div style="--width:{width}px; --height:{height}px">{text}</div> -->
<div
  style="--width:{width}px;--height:{height}px;--size:{fontSize}px;--color:{fontColor};--bgColor:{bgColor};"
>
  {text}
</div>

<style>
  div {
    padding: 16px 0px;
    text-align: center;
    color: var(--color, white);
    background-color: var(--bgColor, black);
    font-size: var(--size, 20px);
    width: var(--width, 200px);
    height: var(--height, 50px);
  }
</style>

<script>
  export let data = [];
  export let height = 50;
  export let maximum;

  let maxSoFar = 50;
  $: data.forEach((datum) => {
    if (datum > maxSoFar) maxSoFar = Math.ceil(datum / 100) * 100;
  });

  let maxInUse = 50;
  $: maxInUse = maximum === undefined ? maxSoFar : maximum;
</script>

<style>
  chart {
    position: relative;

    display: flex;
    align-items: flex-end;

    width: 200px;
    height: var(--height);
    min-height: 50px;
    margin: 8px 20px 8px auto;

    border-bottom: 2px solid black;
    background-color: rgba(0, 0, 0, 0.25);
  }
  stick {
    width: 2px;
    height: var(--height);
    border-top: 1px solid red;
  }
  scale {
    position: absolute;
    font-size: 9pt;
    right: 205px;
  }
  scale.top {
    top: 0;
    margin-top: -5px;
  }
  scale.bottom {
    bottom: 0;
    margin-bottom: -5px;
  }
</style>

<chart style="--height: {height}px">
  <scale class="top">{maxInUse}</scale>
  <scale class="bottom">0</scale>
  {#each data as datum}
    <stick style="--height: {(datum / maxInUse) * height}px" />
  {/each}
</chart>

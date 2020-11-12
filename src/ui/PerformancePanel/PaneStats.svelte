<script>
  import { Pane } from "../LeftPanel";
  import Chart from "./Chart.svelte";

  export let dataStore;
  export let value;
  export let maximum;
</script>

<style>
  lbl {
    background-color: rgba(255, 255, 255, 0.25);
    color: black;
    display: block;
    padding: 4px 16px;

    font-weight: bold;
  }

  lbl info {
    font-weight: normal;
  }
</style>

<Pane>
  <lbl>
    <slot />
    <info>{value || $dataStore[0].toFixed(1)}</info>
  </lbl>
  <Chart data={$dataStore} {maximum} />
</Pane>

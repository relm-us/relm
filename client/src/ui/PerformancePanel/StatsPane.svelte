<script type="ts">
  import { Pane } from "../LeftPanel";
  import Chart from "./Chart.svelte";

  export let title: string;
  export let minimized = true;
  export let dataStore;
  export let value;
  export let maximum;
</script>

<Pane
  {title}
  subtitle={value || $dataStore[0].toFixed(1)}
  showMinimize={true}
  {minimized}>
  <Chart data={$dataStore} {maximum} />
</Pane>

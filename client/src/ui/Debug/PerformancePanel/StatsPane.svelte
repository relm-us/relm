<script type="ts">
  import { Pane } from "~/ui/lib/LeftPanel";
  import Chart from "./Chart.svelte";

  export let title: string;
  export let minimized = true;
  export let dataStore;
  export let value = undefined;
  export let maximum = undefined;

  // ignore warning about missing props
  $$props;
</script>

<Pane {title} subtitle={value || $dataStore[0].toFixed(1)} {minimized}>
  <Chart data={$dataStore} {maximum} />
  <slot />
</Pane>

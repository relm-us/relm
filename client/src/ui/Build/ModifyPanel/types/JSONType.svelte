<script lang="ts">
  import { parse } from "~/utils/parse";
  import TextType from "./TextType.svelte";

  export let key;
  export let component;
  export let prop;

  // ignore warning about missing props
  $$props;
</script>

<TextType
  {key}
  {component}
  {prop}
  formatInput={(value) => JSON.stringify(value)}
  formatOutput={parse}
/>

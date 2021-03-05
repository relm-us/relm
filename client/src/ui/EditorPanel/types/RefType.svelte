<script lang="ts">
  import Capsule from "~/ui/Capsule";

  export let key: string;
  export let prop;

  // suppress warning about unknown props
  $$props;
</script>

<div>
  {(prop.editor && prop.editor.label) || key}:

  <Capsule editable={false} value="[Reference]" />
</div>

<style>
  div {
    margin: 8px 0px 6px 16px;
  }
</style>

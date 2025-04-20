<script lang="ts">
import Capsule from "~/ui/lib/Capsule"

export let key: string
export let prop

// suppress warning about unknown props
$$props
</script>

<r-ref-type>
  {(prop.editor && prop.editor.label) || key}:

  <Capsule editable={false} value="[Reference]" />
</r-ref-type>

<style>
  r-ref-type {
    display: block;
  }
</style>

<script lang="ts">
  import { Relm } from "~/stores/Relm";

  import Button from "~/ui/lib/Button";

  const onClick = () => {
    $Relm.wdoc.reapplyWorld();
  };
</script>

<Button on:click={onClick}>Reset Physics</Button>

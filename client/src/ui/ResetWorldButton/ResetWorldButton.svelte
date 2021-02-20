<script lang="ts">
  import Button from "../Button";
  import { Relm } from "~/stores/Relm";

  const onClick = () => {
    $Relm.wdoc.reapplyWorld();
  };
</script>

<Button on:click={onClick}>Reset Physics</Button>

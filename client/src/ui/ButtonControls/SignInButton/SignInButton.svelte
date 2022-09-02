<script lang="ts">
  import IoMdLogIn from "svelte-icons/io/IoMdLogIn.svelte";

  import CircleButton from "~/ui/lib/CircleButton";
  import { openDialog } from "~/stores/openDialog";
</script>

<div>
  <CircleButton on:click={() => ($openDialog = "signin")} Icon={IoMdLogIn} />
</div>

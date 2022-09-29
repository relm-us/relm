<script lang="ts">
  import CircleButton from "~/ui/lib/CircleButton";
  import IoIosMailOpen from "svelte-icons/io/IoIosMailOpen.svelte";
  import { openDialog } from "~/stores/openDialog";
</script>

<CircleButton
  on:click={() => ($openDialog = "invite")}
  padding={0}
  Icon={IoIosMailOpen}
/>

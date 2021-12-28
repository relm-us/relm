<script lang="ts">
  import { AvatarChooser } from "~/ui/AvatarBuilder";
  import type { Dispatch } from "./RelmStateAndMessage";

  export let dispatch: Dispatch;

  function done() {
    dispatch({ id: "choseAvatar" });
  }
</script>

<AvatarChooser on:done={done} />

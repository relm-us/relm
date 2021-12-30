<script lang="ts">
  import ArrowKeyListener from "./ArrowKeyListener";
  import CopyPasteKeyListener from "./CopyPasteKeyListener";
  import SpaceKeyListener from "./SpaceKeyListener";
  import ShiftKeyListener from "./ShiftKeyListener";
  import DeleteKeyListener from "./DeleteKeyListener";
  import EscapeKeyListener from "./EscapeKeyListener";
  import SwitchModeKeyListener from "./SwitchModeKeyListener";
  import PauseKeyListener from "./PauseKeyListener";
  import UndoRedoKeyListener from "./UndoRedoKeyListener";
  import EnterChatKeyListener from "./EnterChatKeyListener";

  import PointerListener from "./PointerListener";
  import WheelListener from "./WheelListener";

  export let world;
  export let permits;
</script>

<ArrowKeyListener />
<CopyPasteKeyListener />
<SpaceKeyListener />
<ShiftKeyListener />
<DeleteKeyListener />
<EscapeKeyListener />
{#if permits.includes("edit")}
  <SwitchModeKeyListener />
{/if}
<PauseKeyListener />
<UndoRedoKeyListener />
<EnterChatKeyListener />

<PointerListener {world} />
<WheelListener {world} />

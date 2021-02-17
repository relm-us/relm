<script lang="ts">
  import ArrowKeyListener from "./ArrowKeyListener";
  import CopyPasteKeyListener from "./CopyPasteKeyListener";
  import SpaceKeyListener from "./SpaceKeyListener";
  import DeleteKeyListener from "./DeleteKeyListener";
  import SwitchModeKeyListener from "./SwitchModeKeyListener";
  import UndoRedoKeyListener from "./UndoRedoKeyListener";
  import EnterChatKeyListener from "./EnterChatKeyListener";

  import MouseListener from "./MouseListener";
  import WheelListener from "./WheelListener";

  export let world;
</script>

<ArrowKeyListener />
<CopyPasteKeyListener />
<SpaceKeyListener />
<DeleteKeyListener />
<SwitchModeKeyListener />
<UndoRedoKeyListener />
<EnterChatKeyListener />

<MouseListener {world} />
<WheelListener {world} />

<script lang="ts">
  import ArrowKeyListener from "./ArrowKeyListener";
  import CopyPasteKeyListener from "./CopyPasteKeyListener";
  import SpaceKeyListener from "./SpaceKeyListener";
  import SwitchModeKeyListener from "./SwitchModeKeyListener";
  import UndoRedoKeyListener from "./UndoRedoKeyListener";

  import MouseListener from "./MouseListener";

  export let world;
</script>

<ArrowKeyListener />
<CopyPasteKeyListener />
<SpaceKeyListener />
<SwitchModeKeyListener />
<UndoRedoKeyListener />

<MouseListener {world} />

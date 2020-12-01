<script lang="ts">
  import ArrowKeyListener from "./ArrowKeyListener";
  import CopyPasteKeyListener from "./CopyPasteKeyListener";
  import SpaceKeyListener from "./SpaceKeyListener";
  import MouseListener from "./MouseListener";

  export let world;
</script>

<ArrowKeyListener />
<CopyPasteKeyListener />
<SpaceKeyListener />
<MouseListener {world} />

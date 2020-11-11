<script lang="ts">
  import ArrowKeyListener from "./ArrowKeyListener";
  import SpaceKeyListener from "./SpaceKeyListener";
  import MouseListener from "./MouseListener";

  export let world;
</script>

<ArrowKeyListener />
<SpaceKeyListener />
<MouseListener {world} />

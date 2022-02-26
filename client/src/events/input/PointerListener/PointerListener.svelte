<script lang="ts">
  import { worldManager } from "~/world";
  import { hasAncestor } from "~/utils/hasAncestor";
  import { worldUIMode } from "~/stores/worldUIMode";

  import { isInputEvent } from "../isInputEvent";

  import {
    isControllingAvatar,
    onPointerUp,
    onPointerDown,
    onPointerMove,
  } from "./pointerActions";

  function eventTargetsWorld(event, $mode) {
    // Allow dragging Html2d objects, as well as selecting text
    if (isInputEvent(event)) return false;

    // Prevent Renderable overlays (e.g. over websites) from erroneously
    // becoming PointerListener click targets. TODO: make this less hacky?
    if (event.target.tagName === "OVERLAY" && $mode === "play") return false;

    // An HTML element whose ancestor is the viewport is in the "world" (i.e. not part of the UI)
    return hasAncestor(event.target, worldManager.world.presentation.viewport);
  }

  function onRightClick(event: MouseEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    // Disable context menu when targeted at 3D world
    event.preventDefault();
  }

  function onMouseMove(event: MouseEvent) {
    if (isControllingAvatar) {
      // Sometimes mouse movement will highlight text, e.g. avatar name
      window.getSelection().removeAllRanges();
      event.preventDefault();
    }
    if (!eventTargetsWorld(event, $worldUIMode)) return;
    onPointerMove(event.clientX, event.clientY, event.shiftKey);
  }

  function onTouchMove(event: TouchEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    event.preventDefault();

    var touch = event.changedTouches[0];
    onPointerMove(touch.clientX, touch.clientY, event.shiftKey);
  }

  function onMouseDown(event: MouseEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    onPointerDown(event.clientX, event.clientY, event.shiftKey);
  }

  function onTouchStart(event: TouchEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    event.preventDefault();

    var touch = event.changedTouches[0];
    onPointerDown(touch.clientX, touch.clientY, event.shiftKey);
  }
</script>

<svelte:window
  on:mousemove={onMouseMove}
  on:mousedown={onMouseDown}
  on:mouseup={onPointerUp}
  on:touchstart={onTouchStart}
  on:touchmove={onTouchMove}
  on:touchend={onPointerUp}
  on:touchcancel={onPointerUp}
  on:contextmenu={onRightClick}
/>

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
    onPointerAltDown,
  } from "./pointerActions";

  function eventTargetsWorld(event, uiMode) {
    // Allow dragging Html2d objects, as well as selecting text
    if (isInputEvent(event)) return false;

    // Prevent Renderable overlays (e.g. over websites) from erroneously
    // becoming PointerListener click targets. TODO: make this less hacky?
    if (event.target.tagName === "OVERLAY" && uiMode === "play") return false;

    // An HTML element whose ancestor is the viewport is in the "world" (i.e. not part of the UI)
    return hasAncestor(event.target, worldManager.world.presentation.viewport);
  }

  /**
   * Mouse Events
   */

  function onMouseDown(event: MouseEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    onPointerDown(event.clientX, event.clientY, event.shiftKey);
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

  function onMouseUp(event: MouseEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    event.preventDefault();

    onPointerUp();
  }

  function onMouseRightDown(event: MouseEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    // Disable context menu when targeted at 3D world
    event.preventDefault();

    onPointerAltDown(event.clientX, event.clientY);
  }

  /**
   * Touch Events
   */

  function onTouchStart(event: TouchEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    event.preventDefault();

    var touch = event.changedTouches[0];
    onPointerDown(touch.clientX, touch.clientY, event.shiftKey);
  }

  function onTouchMove(event: TouchEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    event.preventDefault();

    var touch = event.changedTouches[0];
    onPointerMove(touch.clientX, touch.clientY, event.shiftKey);
  }

  function onTouchEnd(event: TouchEvent) {
    if (!eventTargetsWorld(event, $worldUIMode)) return;

    event.preventDefault();

    onPointerUp();
  }
</script>

<svelte:window
  on:mousemove={onMouseMove}
  on:mousedown={onMouseDown}
  on:mouseup={onMouseUp}
  on:contextmenu={onMouseRightDown}
  on:touchstart={onTouchStart}
  on:touchmove={onTouchMove}
  on:touchend={onTouchEnd}
  on:touchcancel={onPointerUp}
/>

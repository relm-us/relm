<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import Cropper from "cropperjs";

  import IoIosClose from "svelte-icons/io/IoIosClose.svelte";

  export let image;

  let imgElement: HTMLImageElement;
  let dispatch = createEventDispatcher();
  let cropper;

  function onClose() {
    const canvas = cropper.getCroppedCanvas();
    dispatch("done", { canvas });
  }

  onMount(() => {
    cropper = new Cropper(imgElement);
  });
</script>

<style>
  cropper {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 99;
    background-color: black;
  }

  .icon {
    width: 48px;
    height: 48px;
  }
  .corner {
    position: fixed;
    top: 8px;
    right: 8px;
    z-index: 1;
  }
  button {
    border: none;
    color: white;
    background: none;
    cursor: pointer;
  }
</style>

<cropper>
  <button class="corner icon" on:click={onClose}>
    <IoIosClose />
  </button>
  <img src={image} bind:this={imgElement} alt="Croppable" />
</cropper>

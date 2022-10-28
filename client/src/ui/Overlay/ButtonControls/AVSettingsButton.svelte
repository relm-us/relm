<script lang="ts">
  import type { Dispatch } from "~/main/ProgramTypes";

  import { fly, slide } from "svelte/transition";
  import IoIosSettings from "svelte-icons/io/IoIosSettings.svelte";
  import IoMdArrowRoundDown from "svelte-icons/io/IoMdArrowRoundDown.svelte";
  import { IconVideoEnabled, IconAudioEnabled } from "video-mirror";

  import CircleButton from "~/ui/lib/CircleButton";

  export let dispatch: Dispatch;

  let drawingAttention = false;

  const onClick = () => {
    dispatch({ id: "setUpAudioVideo" });
  };

  export function drawAttention() {
    drawingAttention = true;
    setTimeout(() => (drawingAttention = false), 2000);
  }
</script>

<r-av-settings>
  {#if drawingAttention}
    <r-attention in:fly={{ y: -100 }} out:fly>
      <IoMdArrowRoundDown />
    </r-attention>
  {/if}
  <CircleButton on:click={onClick} Icon={IoIosSettings} iconSize={28}>
    <div class="left"><IconVideoEnabled /></div>
    <div class="right"><IconAudioEnabled /></div>
  </CircleButton>
</r-av-settings>

<style>
  r-av-settings {
    display: block;
  }

  r-av-settings :global(icon) {
    margin-top: 10px;
  }

  div {
    position: absolute;
    top: 5px;
    width: 17px;
    color: #bbb;
  }
  div.left {
    left: 10px;
  }
  div.right {
    left: 26px;
  }

  r-attention {
    display: block;
    width: 100px;
    height: 100px;

    position: absolute;
    bottom: 46px;
    left: 26px;

    transform: translateX(-50%);

    color: var(--selected-orange);
  }
</style>

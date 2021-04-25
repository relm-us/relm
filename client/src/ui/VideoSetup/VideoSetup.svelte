<script>
  import { createEventDispatcher } from "svelte";
  import { VideoMirror } from "video-mirror";
  import relmLogo from "./relm-logo.png";

  let videoSetup = true;

  const dispatch = createEventDispatcher();

  function joinWith({ detail }) {
    // console.log("join", detail);
    dispatch("done", detail);
    videoSetup = false;
  }

  function joinWithout() {
    videoSetup = false;
  }
</script>

{#if videoSetup}
  <setup>
    <logo>
      <img src={relmLogo} alt="logo" />
    </logo>
    <message>
      You're about to join a social experience with audio & video.
    </message>
    <VideoMirror on:done={joinWith} />
    <or>or</or>
    <button on:click={joinWithout}> Join without audio / video </button>
  </setup>
{/if}

<style>
  setup {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    position: fixed;
    overflow-y: auto;
    width: 100%;
    height: 100%;
    z-index: 4;

    background: rgba(45, 45, 45, 1);
    color: white;
  }

  logo {
    display: block;

    width: 50vw;
    height: 150px;
    max-width: 300px;
    max-height: 150px;

    margin-top: 5vh;
  }

  logo img {
    width: 100%;
  }

  message {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    text-align: center;
    margin: 8px 8px 3vh 8px;
  }

  or {
    font-size: 18px;
    color: #bbb;
    margin: 16px 0px;
  }

  button {
    border: none;
    background-color: transparent;
    padding: 4px 8px;
    cursor: pointer;

    text-decoration: underline;
    font-size: 18px;
    color: #bbb;
  }
</style>

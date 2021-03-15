<script>
  import { VideoMirror } from "video-mirror";

  let videoSetup = true;

  function joinWith({ detail }) {
    console.log("join", detail);
    videoSetup = false;
  }

  function joinWithout() {
    videoSetup = false;
  }
</script>

{#if videoSetup}
  <setup>
    <logo />
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
    width: 100%;
    height: 100%;
    z-index: 4;

    background: rgba(45, 45, 45, 1);
    color: white;
  }

  logo {
    display: block;

    width: 299px;
    height: 116px;
    background-image: url(/relm-logo.png);
    background-size: 299px 116px;

    margin-top: 48px;
  }

  message {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    margin: 32px 0px;
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

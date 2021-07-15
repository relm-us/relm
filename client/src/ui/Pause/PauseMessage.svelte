<script>
  import Button from "~/ui/lib/Button";
  import { playState } from "~/stores/playState";
</script>

<message>
  <div>Paused</div>
  <Button on:click={() => ($playState = "playing")}>continue</Button>
</message>

<style>
  message {
    display: flex;
    flex-direction: column;
    align-items: center;

    position: absolute;
    z-index: 3;
    top: 40%;
    left: 50%;
    transform: translate(-50%);

    font-size: 6vw;
    color: white;
  }
</style>

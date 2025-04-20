<script>
import Happy from "./emojis/Happy.svelte"
import Heart from "./emojis/Heart.svelte"
import Laughing from "./emojis/Laughing.svelte"
import Sad from "./emojis/Sad.svelte"

export let content

const emojis = {
  HAPPY: Happy,
  HEART: Heart,
  LAUGHING: Laughing,
  SAD: Sad,
}

// ignore warning about missing props
$$props
</script>

<emoji>
  <svelte:component this={emojis[content]} />
</emoji>

<style lang="scss">
  emoji {
    display: block;
    width: 48px;
    height: 48px;
    animation-name: fade, shake;
    animation-duration: 5s, 5s;
    animation-fill-mode: forwards, forwards;
    animation-iteration-count: 1, 1;
    animation-timing-function: linear, linear; //cubic-bezier(0.36, 0.07, 0.19, 0.97);
  }

  /* prettier-ignore */
  @keyframes fade {
    0% { opacity: 1;}
    66% { opacity: 1;}
    100% { opacity: 0;}
  }
  /* prettier-ignore */
  @keyframes shake {
    10% { transform: translate3d(-10px, -10px, 0px); }
    20% { transform: translate3d(10px,  -20px, 0px); }
    30% { transform: translate3d(-10px, -30px, 0px); }
    40% { transform: translate3d(10px,  -40px, 0px); }
    50% { transform: translate3d(-10px, -50px, 0px); }
    60% { transform: translate3d(10px,  -60px, 0px); }
    70% { transform: translate3d(-10px, -70px, 0px); }
    80% { transform: translate3d(10px,  -80px, 0px); }
    90% { transform: translate3d(-10px, -90px, 0px); }
    100% { transform: translate3d(10px, -100px, 0px); }
  }
</style>

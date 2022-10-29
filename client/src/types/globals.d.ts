export {};

declare global {
  var RAPIER: any;
}

namespace svelte.JSX {
  interface VMVideoProps extends SvelteVideoProps {
    disablepictureinpicture?: string | undefined | null;
  }

  interface IntrinsicElements {
    video: HTMLProps<HTMLVideoElement> & VMVideoProps;
  }
}

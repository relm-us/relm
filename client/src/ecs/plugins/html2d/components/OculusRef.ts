import { SvelteComponent } from "svelte";
import { LocalComponent, RefType } from "~/ecs/base";

export class OculusRef extends LocalComponent {
  container: HTMLElement;
  component: SvelteComponent;

  static props = {
    container: {
      type: RefType,
    },

    component: {
      type: RefType,
    },
  };
}

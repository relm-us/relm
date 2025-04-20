import type { SvelteComponent } from "svelte"
import { StateComponent, RefType } from "~/ecs/base"

export class OculusRef extends StateComponent {
  container: HTMLElement
  component: SvelteComponent

  static props = {
    container: {
      type: RefType,
    },

    component: {
      type: RefType,
    },
  }
}

import { LocalComponent, RefType } from "hecs";

export class Impact extends LocalComponent {
  static props = {
    others: {
      type: RefType,
    },
  };
}

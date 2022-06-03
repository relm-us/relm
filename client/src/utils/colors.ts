import { UNIQUE_COLOR_PALETTE } from "~/config/constants";
import { pickOne } from "./pickOne";

export function randomColor() {
  return pickOne(UNIQUE_COLOR_PALETTE);
}

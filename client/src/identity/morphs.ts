import { pickOne } from "~/utils/pickOne";

export function randomMorphInfluences() {
  const gender = pickOne([0.1, 0.2, 0.3, 0.7, 0.8, 0.9]);
  let hair1 = Math.random() * 0.2;
  let hair2 = 0;
  if (gender > 0.7) hair1 = 0.3;
  if (gender > 0.8) hair2 = 0.4;
  const influences = {
    gender,
    "wide": pickOne([0, 0, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5]),
    "hair": hair1,
    "hair-02": hair2,
  };
  return influences;
}

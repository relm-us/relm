import { Appearance, BinaryGender } from "./types.js";
import { AVAILABLE_HAIR_COLORS, AVAILABLE_SKIN_COLORS } from "./constants.js";

export function getDefaultAppearance(gender: BinaryGender): Appearance {
  return {
    genderSlider: gender === "male" ? 0.15 : 0.85,
    widthSlider: 0.1,

    beard: false,
    belt: true,
    hair: gender === "male" ? "short" : "mid",
    top: 4,
    bottom: 3,
    shoes: gender === "male" ? 3 : 4,

    skinColor: AVAILABLE_SKIN_COLORS[2],
    hairColor: AVAILABLE_HAIR_COLORS[2],
    topColor: "#fbfbfb",
    bottomColor: "#2e2b19",
    beltColor: "#7a6f38",
    shoeColor: "#080705",
  };
}
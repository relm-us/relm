import { Appearance, BinaryGender } from "./types.js";
import { AVAILABLE_HAIR_COLORS, AVAILABLE_SKIN_COLORS } from "./constants.js";

import { HairType } from "./types.js";
import { isValidColor } from "../utils/isValidColor.js";

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
    fantasySkinColor: AVAILABLE_SKIN_COLORS[2],
    hairColor: AVAILABLE_HAIR_COLORS[2],
    topColor: "#fbfbfb",
    bottomColor: "#2e2b19",
    beltColor: "#7a6f38",
    shoeColor: "#080705",
  };
}

function inclusiveCheck(value: number, lower: number, upper: number) {
  return value >= lower && value <= upper;
}

function isValidHair(hair) {
  return (["bald", "short", "mid", "long"] as HairType[]).includes(hair);
}

/**
 * Checks if the provided appearance payload contains all the properties of a valid Appearance object
 * It does not check for any other properties that are not included in a Appearance object
 * @param payload the payload to check
 * @returns if the appearance contains valid Appearance properties.
 */
export function isValidAppearance(payload) {
  return (
    typeof payload === "object" &&
    typeof payload.genderSlider === "number" &&
    inclusiveCheck(payload.genderSlider, 0, 1) &&
    typeof payload.widthSlider === "number" &&
    inclusiveCheck(payload.widthSlider, 0, 1) &&
    typeof payload.beard === "boolean" &&
    typeof payload.belt === "boolean" &&
    typeof payload.hair === "string" &&
    isValidHair(payload.hair) &&
    typeof payload.top === "number" &&
    inclusiveCheck(payload.top, 0, 4) &&
    typeof payload.bottom === "number" &&
    inclusiveCheck(payload.bottom, 0, 4) &&
    typeof payload.shoes === "number" &&
    inclusiveCheck(payload.shoes, 0, 4) &&
    typeof payload.skinColor === "string" &&
    isValidColor(payload.skinColor) &&
    typeof payload.fantasySkinColor === "string" &&
    isValidColor(payload.fantasySkinColor) &&
    typeof payload.hairColor === "string" &&
    isValidColor(payload.hairColor) &&
    typeof payload.topColor === "string" &&
    isValidColor(payload.topColor) &&
    typeof payload.bottomColor === "string" &&
    isValidColor(payload.bottomColor) &&
    typeof payload.beltColor === "string" &&
    isValidColor(payload.beltColor) &&
    typeof payload.shoeColor === "string" &&
    isValidColor(payload.shoeColor)
  );
}

import { HairType } from "./types.js";

const HEX_COLOR_CODE_REGEX = /^#[A-Fa-f0-9]{6}$/;

function inclusiveCheck(value : number, lower : number, upper : number) {
  return value >= lower && value <= upper;
}

function isValidColor(color : string) {
  return HEX_COLOR_CODE_REGEX.test(color);
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
  return (typeof payload.genderSlider === "number" && inclusiveCheck(payload.genderSlider, 0, 1))
            && (typeof payload.widthSlider === "number" && inclusiveCheck(payload.widthSlider, 0, 1))
            && (typeof payload.beard === "boolean")
            && (typeof payload.belt === "boolean")
            && (typeof payload.hair === "string" && isValidHair(payload.hair))
            && (typeof payload.top === "number" && inclusiveCheck(payload.top, 0, 4))
            && (typeof payload.bottom === "number" && inclusiveCheck(payload.bottom, 0, 4))
            && (typeof payload.shoes === "number" && inclusiveCheck(payload.shoes, 0, 4))
            && (typeof payload.skinColor === "string" && isValidColor(payload.skinColor))
            && (typeof payload.hairColor === "string" && isValidColor(payload.hairColor))
            && (typeof payload.topColor === "string" && isValidColor(payload.topColor))
            && (typeof payload.bottomColor === "string" && isValidColor(payload.bottomColor))
            && (typeof payload.beltColor === "string" && isValidColor(payload.beltColor))
            && (typeof payload.shoeColor === "string" && isValidColor(payload.shoeColor));
}
import { pickOne } from "~/utils/pickOne";

export function randomSkintone() {
  return pickOne(["#c58c85", "#ecbcb4", "#d1a3a4", "#a1665e", "#503335"]);
}

export function randomHairColor() {
  return pickOne(["#aa8866", "#debe99", "#241c11", "#4f1a00", "#9a3300"]);
}

export function randomClothingColor(season = "spring") {
  // Spring clothing https://www.color-hex.com/color-palette/104600
  let colors = ["#a5e39f", "#f25a8f", "#f69419", "#fff8b3", "#e5aef9"];

  // Fall clothing https://www.color-hex.com/color-palette/44603
  if (season === "fall")
    colors = ["#88a085", "#ebeae2", "#927655", "#c0992a", "#a34c5e"];

  // Summer clothing https://www.color-hex.com/color-palette/51176
  if (season === "summer")
    colors = ["#fbfbfb", "#58bfbb", "#8a8a8a", "#2f4479", "#000000"];

  return pickOne(colors);
}

export function getCharacterFacemaps({
  skintone = randomSkintone(),
  hairColor = randomHairColor(),
  topColor = null,
  bottomColor = null,
  shoeColor = null,
  beltColor = "#000000",
  hair = true,
  beard = false,
  shoes = true,
  belt = false,
  top = pickOne([1, 2, 3]),
  bottom = pickOne([1, 2, 3, 4]),
}: {
  skintone?: string;
  hairColor?: string;
  topColor?: string;
  bottomColor?: string;
  shoeColor?: string;
  beltColor?: string;
  hair?: boolean;
  beard?: boolean;
  shoes?: boolean;
  belt?: boolean;
  top?: number;
  bottom?: number;
} = {}) {
  const season = pickOne(["spring", "fall", "summer"]);
  if (topColor === null) topColor = randomClothingColor(season);
  if (bottomColor === null) bottomColor = randomClothingColor(season);
  if (shoeColor === null) shoeColor = randomClothingColor(season);

  const opacity = 0.9;
  const colors = {
    "skin": [skintone, opacity],
    "beard": [beard ? hairColor : skintone, opacity],
    "hair": [hair ? hairColor : skintone, opacity],
    "top-01": [top > 0 ? topColor : skintone, opacity],
    "top-02": [top > 1 ? topColor : skintone, opacity],
    "top-03": [top > 2 ? topColor : skintone, opacity],
    "belt": [belt ? beltColor : topColor, opacity],
    "pants-01": [bottom > 0 ? bottomColor : skintone, opacity],
    "pants-02": [bottom > 1 ? bottomColor : skintone, opacity],
    "pants-03": [bottom > 2 ? bottomColor : skintone, opacity],
    "pants-04": [bottom > 3 ? bottomColor : skintone, opacity],
    "shoes": [shoes ? shoeColor : skintone, opacity],
  };
  console.log("colors", colors);
  return colors;
}

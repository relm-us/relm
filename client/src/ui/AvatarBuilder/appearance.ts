// *** morph targets:
// gender
// wide
// hair
// hair-02

// *** vertex group colors:
// beard
// belt
// hair
// pants-01 PANTS
// pants-02 PANTS/SKIN (thighs -> skin if shorts)
// pants-03 PANTS/SKIN (knees -> skin if long shorts)
// pants-04 PANTS/SKIN (bottom of pants -> skin if capris)
// shoes-01 SHOES (shoe sides)
// shoes-02 SHOES/SKIN (shoe tops -> skin if slippers)
// shoes-03 SHOES/SKIN (ankles -> skin if no socks)
// skin
// top-01 SHIRT
// top-02 SHIRT/SKIN (shoulders, neck & midriff -> skin if sports bra)
// top-03 SHIRT/SKIN (elbows -> skin if T-shirt)
// top-04 SHIRT/SKIN (forearm -> skin if half-sleeve)

// hairType: "none" | "hair"
// beardType: "none" | "beard"
// beltType: "none" | "belt"
// topType: "none" | "crop" | "tshirt" | "midsleeve" | "longsleeve"
// bottomType: "shorts" | "kneelength" | "capris" | "pants"
// shoeType: "none" | "slippers" | "shoes" | "boots"

// skinColor
// hairColor
// topColor
// bottomColor
// beltColor
// shoeColor

// prettier-ignore
export const skintones = [
    "#e3d0cf", "#ddbfb4", "#e5b69e", "#d5b9ad", "#d9ad9f", "#d59187",
    "#d08778", "#c8947a", "#c78164", "#a56049", "#6d3325", "#342723",
  ];

// prettier-ignore
export const hairtones = [
    "#debe99", "#aa8866", "#241c11", "#4f1a00", "#9a3300"
  ];

const skintoneCenterFactor = 1 / skintones.length / 2;
const hairtoneCenterFactor = 1 / hairtones.length / 2;

export type HairType = "bald" | "short" | "mid" | "long";
export type TopType = 0 | 1 | 2 | 3 | 4;
export type BottomType = 0 | 1 | 2 | 3;
export type ShoeType = 0 | 1 | 2 | 3;

type Appearance = {
  genderSlider: number;
  skintoneSlider: number;
  widthSlider: number;
  hairtoneSlider: number;

  beard: boolean;
  belt: boolean;
  hair: HairType;
  top: TopType;
  bottom: BottomType;
  shoes: ShoeType;

  topColor: string;
  bottomColor: string;
  beltColor: string;
  shoeColor: string;
};

export function appearanceToCharacterTraits(appearance: Appearance) {
  let genderSlider = appearance.genderSlider;
  let widthSlider = appearance.widthSlider;
  let hairSlider1 = 0.5;
  let hairSlider2 = 1;

  const skinGroup = ["skin"];
  const hairGroup = [];
  const topGroup = [];
  const bottomGroup = ["pants-01"];
  const beltGroup = [];
  const shoeGroup = [];

  if (appearance.beard) {
    hairGroup.push("beard");
  } else {
    // no beard
    skinGroup.push("beard");
  }

  if (appearance.belt) {
    beltGroup.push("belt");
  } else {
    // no belt
    if (appearance.top === 0) {
      // no shirt
      skinGroup.push("belt");
    } else {
      topGroup.push("belt");
    }
  }

  switch (appearance.hair) {
    case "bald":
      skinGroup.push("hair");
      hairSlider1 = 0;
      hairSlider2 = 0;
      break;
    case "short":
      hairGroup.push("hair");
      hairSlider1 = 0;
      hairSlider2 = 1;
      break;
    case "mid":
      hairGroup.push("hair");
      hairSlider1 = 0.3;
      hairSlider2 = 1;
      break;
    case "long":
      hairGroup.push("hair");
      hairSlider1 = 0.5;
      hairSlider2 = 1;
      break;
  }

  (appearance.top < 1 ? skinGroup : topGroup).push("top-01");
  (appearance.top < 2 ? skinGroup : topGroup).push("top-02");
  (appearance.top < 3 ? skinGroup : topGroup).push("top-03");
  (appearance.top < 4 ? skinGroup : topGroup).push("top-04");

  (appearance.bottom < 1 ? skinGroup : bottomGroup).push("pants-02");
  (appearance.bottom < 2 ? skinGroup : bottomGroup).push("pants-03");
  (appearance.bottom < 3 ? skinGroup : bottomGroup).push("pants-04");

  (appearance.shoes < 1 ? skinGroup : shoeGroup).push("shoes-01");
  (appearance.shoes < 2 ? skinGroup : shoeGroup).push("shoes-02");
  (appearance.shoes < 3 ? skinGroup : shoeGroup).push("shoes-03");

  const charColors = {};
  const skinTone =
    skintones[
      Math.floor(
        (appearance.skintoneSlider + skintoneCenterFactor) *
          (skintones.length - 1)
      )
    ];
  const hairTone =
    hairtones[
      Math.floor(
        (appearance.hairtoneSlider + hairtoneCenterFactor) *
          (hairtones.length - 1)
      )
    ];
  for (const vertexGroup of skinGroup)
    charColors[vertexGroup] = [skinTone, 0.9];
  for (const vertexGroup of hairGroup)
    charColors[vertexGroup] = [hairTone, 0.9];
  for (const vertexGroup of topGroup)
    charColors[vertexGroup] = [appearance.topColor, 0.9];
  for (const vertexGroup of bottomGroup)
    charColors[vertexGroup] = [appearance.bottomColor, 0.9];
  for (const vertexGroup of beltGroup)
    charColors[vertexGroup] = [appearance.beltColor, 0.9];
  for (const vertexGroup of shoeGroup)
    charColors[vertexGroup] = [appearance.shoeColor, 0.9];

  const charMorphs = {
    "gender": genderSlider,
    "wide": widthSlider,
    "hair": hairSlider1,
    "hair-02": hairSlider2,
  };

  return { charColors, charMorphs };
}

import { Appearance, AVAILABLE_HAIR_COLORS, AVAILABLE_SKIN_COLORS, BinaryGender } from "relm-common";

import { Morph } from "~/ecs/plugins/morph";
import { FaceMapColors } from "~/ecs/plugins/coloration";

import { AvatarEntities } from "~/types";

export function setAppearance(
  this: void,
  entities: AvatarEntities,
  appearance: Appearance
) {
  const { morphs, colors } = appearanceToCharacterTraits(appearance);

  if (morphs) {
    if (!entities.body.has(Morph)) {
      entities.body.add(Morph, { influences: morphs });
    } else {
      const morph = entities.body.get(Morph);
      morph.influences = morphs;
      morph.modified();
    }
  }

  if (colors) {
    if (!entities.body.has(FaceMapColors)) {
      entities.body.add(FaceMapColors, { colors });
    } else {
      const facemap = entities.body.get(FaceMapColors);
      facemap.colors = colors;
      facemap.modified();
    }
  }
}

/**
 * The character settings that make up an Avatar are as follows:
 *
 * Morph Targets:
 * - gender
 * - wide
 * - hair
 * - hair-02
 *
 * Facemap Colors:
 * - beard
 * - belt
 * - hair
 * - pants-01 PANTS
 * - pants-02 PANTS/SKIN (thighs -> skin if shorts)
 * - pants-03 PANTS/SKIN (knees -> skin if long shorts)
 * - pants-04 PANTS/SKIN (bottom of pants -> skin if capris)
 * - shoes-01 SHOES (shoe sides)
 * - shoes-02 SHOES/SKIN (shoe tops -> skin if slippers)
 * - shoes-03 SHOES/SKIN (ankles -> skin if no socks)
 * - skin
 * - top-01 SHIRT
 * - top-02 SHIRT/SKIN (shoulders, neck & midriff -> skin if sports bra)
 * - top-03 SHIRT/SKIN (elbows -> skin if T-shirt)
 * - top-04 SHIRT/SKIN (forearm -> skin if half-sleeve)
 *
 */

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

function appearanceToCharacterTraits(appearance: Appearance): {
  morphs: object;
  colors: object;
} {
  if (!appearance) throw Error("avatar appearance undefined");

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
    if (appearance.top === 0 || appearance.top === 1) {
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
  if (appearance.shoes === 4) {
    shoeGroup.push("pants-04");
  } else {
    (appearance.bottom < 3 ? skinGroup : bottomGroup).push("pants-04");
  }

  (appearance.shoes < 1 ? skinGroup : shoeGroup).push("shoes-01");
  (appearance.shoes < 2 ? skinGroup : shoeGroup).push("shoes-02");
  (appearance.shoes < 3 ? skinGroup : shoeGroup).push("shoes-03");

  const colors = {};
  for (const vertexGroup of skinGroup)
    colors[vertexGroup] = [appearance.skinColor, 0.9];
  for (const vertexGroup of hairGroup)
    colors[vertexGroup] = [appearance.hairColor, 0.9];
  for (const vertexGroup of topGroup)
    colors[vertexGroup] = [appearance.topColor, 0.9];
  for (const vertexGroup of bottomGroup)
    colors[vertexGroup] = [appearance.bottomColor, 0.9];
  for (const vertexGroup of beltGroup)
    colors[vertexGroup] = [appearance.beltColor, 0.9];
  for (const vertexGroup of shoeGroup)
    colors[vertexGroup] = [appearance.shoeColor, 0.9];

  const morphs = {
    "gender": genderSlider,
    "wide": widthSlider,
    "hair": hairSlider1,
    "hair-02": hairSlider2,
  };

  return { morphs, colors };
}

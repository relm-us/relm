// Used for "simple" AvatarChooser
export type BinaryGender = "male" | "female";

export type HairType = "bald" | "short" | "mid" | "long";
/**
 * TopType
 *   0: No Top
 *   1: Sports Bra
 *   2: T-Shirt
 *   3: Midsleeve Shirt
 *   4: Longsleeve Shirt
 */
export type TopType = 0 | 1 | 2 | 3 | 4;

/**
 * BottomType
 *   0: Shorts
 *   1: Long Shorts
 *   2: Capris
 *   3: Pants
 */
export type BottomType = 0 | 1 | 2 | 3;

/**
 * ShoeType
 *   0: Barefoot
 *   1: Dance Slippers
 *   2: Runners
 *   3: Hightops
 *   4: Boots
 */
export type ShoeType = 0 | 1 | 2 | 3 | 4;

export type Appearance = {
  genderSlider: number;
  widthSlider: number;

  beard: boolean;
  belt: boolean;
  hair: HairType;
  top: TopType;
  bottom: BottomType;
  shoes: ShoeType;

  skinColor: string;
  hairColor: string;
  topColor: string;
  bottomColor: string;
  beltColor: string;
  shoeColor: string;
};

export type Equipment = {
  bone: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
  model?: string;
  colors?: any;
};

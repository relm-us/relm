import { BufferSchema } from "@geckos.io/typed-array-buffer-schema";
import {
  uint8,
  int16,
  string8,
  float32,
} from "@geckos.io/typed-array-buffer-schema";

export const playerSchema = BufferSchema.schema("player", {
  participantId: { type: string8, length: 36 }, // UUID

  // Position of the avatar in the world
  x: { type: int16, digits: 5 },
  y: { type: int16, digits: 5 },
  z: { type: int16, digits: 5 },

  // Participant facing direction
  theta: { type: float32 },

  // Participant's head direction
  headTheta: { type: float32 },

  // Height at which the oculus "floats" above the avatar
  oculusOffset: { type: int16, digits: 5 },

  // low bits are clipIndex; high bit used as animLoop boolean
  animation: { type: uint8 },
});

// export const playerSchema = BufferSchema.schema("player", {
//   participantId: { type: string8, length: 36 }, // UUID
//   name: { type: string8, length: 6 },
//   status: { type: string8, length: 8 },
//   color: { type: string8, length: 6 },
//   x: { type: int16, digits: 5 },
//   y: { type: int16, digits: 5 },
//   z: { type: int16, digits: 5 },
//   theta: { type: float32 },
//   headTheta: { type: float32 },
//   oculusOffset: { type: int16, digits: 5 },
//   clipIndex: { type: uint8 }, // Animation; used with animLoop

//   /**
//    * speaking: boolean;
//    * emoting: boolean;
//    * showAudio: boolean;
//    * showVideo: boolean;
//    * animLoop: boolean;
//    */
//   actionBooleans: { type: bool8 },

//   // appearance?: Appearance;
//   // equipment?: Equipment;
//     equipBone: {type:string8, length:32},
//     equipX: {type:int16, digits:5},
//     equipY: {type:int16, digits:5},
//     equipZ: {type:int16, digits:5},
//     equipRX: {type:float32},
//     equipRY: {type:float32},
//     equipRZ: {type:float32},
//     equipRW: {type:float32},
//     equipSX: {type:int16, digits:5},
//     equipSY: {type:int16, digits:5},
//     equipSZ: {type:int16, digits:5},
//     equipModel: {type:string8, length:64},
//     colors?: any;

//   // clientId?: number;
//   // message?: string;
//   // emoji?: string;

//   /**
//    * beard: boolean;
//    * belt: boolean;
//    */
//   appearanceBooleans: { type: bool8 },

//   // Appearance
//   genderSlider: { type: int16, digits: 5 },
//   widthSlider: { type: int16, digits: 5 },
//   hair: { type: string8, length: 8 }, // HairType
//   top: { type: uint8 }, // TopType
//   bottom: { type: uint8 }, // BottomType
//   shoes: { type: uint8 }, // ShoeType
//   skinColor: { type: string8, length: 6 },
//   hairColor: { type: string8, length: 6 },
//   topColor: { type: string8, length: 6 },
//   bottomColor: { type: string8, length: 6 },
//   beltColor: { type: string8, length: 6 },
//   shoeColor: { type: string8, length: 6 },
// });

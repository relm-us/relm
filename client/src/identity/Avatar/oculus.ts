import { Vector3 } from "three";

import { Oculus, OculusRef } from "~/ecs/plugins/html2d";

import { AvatarEntities, PlayerID } from "../types";

const OCULUS_HEIGHT = 2.4;

export function setOculus(
  this: void,
  entities: AvatarEntities,
  playerId: PlayerID,
  showAudio: boolean,
  showVideo: boolean
) {
  if (!entities.body.has(Oculus)) {
    entities.body.add(Oculus, {
      playerId,
      hanchor: 0,
      vanchor: 2,
      showAudio,
      showVideo,
      offset: new Vector3(0, OCULUS_HEIGHT, 0),
    });
  } else {
    const component = entities.body.get(OculusRef)?.component;

    if (component) {
      component.$set({ showAudio, showVideo });
    }
  }
}

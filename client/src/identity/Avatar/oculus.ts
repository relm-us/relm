import type { AvatarEntities } from "~/types";

import { Vector3 } from "three";

import { OCULUS_HEIGHT_STAND } from "~/config/constants";
import { Oculus, OculusRef } from "~/ecs/plugins/html2d";

export function setOculus(
  this: void,
  entities: AvatarEntities,
  participantId: string,
  showAudio: boolean,
  showVideo: boolean
) {
  if (!entities.body.has(Oculus)) {
    entities.body.add(Oculus, {
      participantId,
      hanchor: 0,
      vanchor: 2,
      showAudio,
      showVideo,
      offset: new Vector3(0, OCULUS_HEIGHT_STAND, 0),
      targetOffset: new Vector3(0, OCULUS_HEIGHT_STAND, 0),
    });
  } else {
    const component = entities.body.get(OculusRef)?.component;

    if (component) {
      component.$set({ showAudio, showVideo });
    }
  }
}

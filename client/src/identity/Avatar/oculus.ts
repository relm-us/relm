import type { AvatarEntities } from "~/types";

import { Vector3 } from "three";

import { OCULUS_HEIGHT_STAND } from "~/config/constants";
import { Oculus, OculusRef } from "~/ecs/plugins/html2d";
import { CameraGravity } from "~/ecs/plugins/camera";

export function setOculus(
  entities: AvatarEntities,
  participantId: string,
  name: string,
  color: string,
  onDidEdit: (content: string) => void,
  showAudio: boolean,
  showVideo: boolean
) {
  if (!entities.body.has(Oculus)) {
    entities.body.add(Oculus, {
      participantId,
      hanchor: 0,
      vanchor: 2,
      participantName: name,
      color,
      showAudio,
      showVideo,
      onChange: onDidEdit,
      offset: new Vector3(0, OCULUS_HEIGHT_STAND, 0),
      targetOffset: new Vector3(0, OCULUS_HEIGHT_STAND, 0),
    });
  } else {
    const component = entities.body.get(OculusRef)?.component;
    if (component) {
      component.$set({ participantName: name, color, showAudio, showVideo });
    }

    const oculus = entities.body.get(Oculus);
    if (oculus) {
      oculus.onChange = onDidEdit;
      oculus.participantName = name;
      oculus.color = color;
      oculus.showAudio = showAudio;
      oculus.showVideo = showVideo;
    }
  }

  const gravity = entities.body.get(CameraGravity);
  if (showVideo) {
    gravity.offset.set(0, OCULUS_HEIGHT_STAND, 0);
  } else {
    gravity.offset.set(0, 0, 0);
  }
}

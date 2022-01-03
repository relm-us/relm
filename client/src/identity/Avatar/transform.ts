import { Vector3, Euler, AnimationClip } from "three";

import { Transform } from "~/ecs/plugins/core";
import { ModelRef } from "~/ecs/plugins/model";
import { Animation } from "~/ecs/plugins/animation";

import { PlayerID, TransformData, AvatarEntities } from "../types";

const e1 = new Euler(0, 0, 0, "YXZ");
const v1 = new Vector3();

export function getTransformData(
  this: void,
  playerId: PlayerID,
  entities: AvatarEntities
) {
  if (!entities.body) return;

  const transform = entities.body.get(Transform);
  if (!transform) return;

  const transformData: any[] = [playerId];

  // Get position of body
  transform.position.toArray(transformData, 1);

  // Get angle of body
  e1.setFromQuaternion(transform.rotation);
  transformData[4] = e1.y;

  // Get angle of head
  transformData[5] = entities.headAngle;

  const clips: AnimationClip[] = entities.body.get(ModelRef)?.animations;
  const clipName: string = entities.body.get(Animation)?.clipName;
  if (clips && clipName) {
    const index = clips.findIndex((c) => c.name === clipName);
    transformData[6] = index;
  }

  return transformData as TransformData;
}

export function setTransformData(
  this: void,
  entities: AvatarEntities,
  [_playerId, x, y, z, theta, headTheta, clipIndex]: TransformData
) {
  if (!entities.body) return;

  const transform = entities.body.get(Transform);

  // Set position of body
  v1.set(x, y, z);
  (transform.position as Vector3).lerp(v1, 0.3333);

  // Set angle of body
  e1.setFromQuaternion(transform.rotation);
  e1.y = theta;
  transform.rotation.setFromEuler(e1);

  // Set angle of head
  entities.headAngle = headTheta;

  const clips = entities.body.get(ModelRef)?.animations;
  const animation = entities.body.get(Animation);
  if (clips && clipIndex >= 0 && clipIndex < clips.length) {
    const newClipName = clips[clipIndex].name;
    if (animation.clipName !== newClipName) {
      animation.clipName = newClipName;
      animation.modified();
    }
  }
}

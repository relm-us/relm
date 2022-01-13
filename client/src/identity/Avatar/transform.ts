import { Vector3, Euler, AnimationClip } from "three";

import { Transform } from "~/ecs/plugins/core";
import { ModelRef } from "~/ecs/plugins/model";
import { Animation } from "~/ecs/plugins/animation";
import { RigidBody } from "~/ecs/plugins/physics";

import { PlayerID, TransformData, AvatarEntities, Participant } from "../types";
import { Avatar } from "../Avatar";
import { makeRemoteAvatar } from "./makeAvatar";
import { setAvatarFromParticipant } from "./setAvatarFromParticipant";
import { DecoratedECSWorld } from "types/DecoratedECSWorld";

const e1 = new Euler(0, 0, 0, "YXZ");
const v1 = new Vector3();

export function participantToTransformData(
  this: void,
  participant: Participant
): TransformData {
  if (!participant?.avatar) return;

  const entities = participant.avatar.entities;

  if (!entities.body) return;

  const transform = entities.body.get(Transform);
  if (!transform) return;

  const transformData: any[] = [participant.participantId];

  // Get position of body
  transform.position.toArray(transformData, 1);

  // Get angle of body
  e1.setFromQuaternion(transform.rotation);
  transformData[4] = e1.y;

  // Get angle of head
  // transformData[5] = entities.headAngle;

  const clips: AnimationClip[] = entities.body.get(ModelRef)?.animations;
  const clipName: string = entities.body.get(Animation)?.clipName;
  if (clips && clipName) {
    const index = clips.findIndex((c) => c.name === clipName);
    transformData[6] = index;
  }

  return transformData as TransformData;
}

export function setTransformDataOnParticipant(
  this: void,
  participant: Participant,
  [playerId, x, y, z, theta, headTheta, clipIndex]: TransformData
) {
  if (!participant) {
    console.warn("expecting participant, got null", playerId);
    return;
  }

  // Record that we've seen this participant now, so we can know which
  // participants are currently active
  participant.lastSeen = performance.now();

  if (!participant.avatar) return;

  const entities = participant.avatar.entities;

  if (!entities.body) return;

  const transform = entities.body.get(Transform);
  const rigidBody = entities.body.get(RigidBody);

  // Set position of body
  v1.set(x, y, z);
  (transform.position as Vector3).lerp(v1, 0.3333);
  // transform.position.set(x, y, z);
  // Update physics
  rigidBody.sync = true;

  // Set angle of body
  e1.setFromQuaternion(transform.rotation);
  e1.y = theta;
  transform.rotation.setFromEuler(e1);

  // Set angle of head
  // entities.headAngle = headTheta;

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

export function setTransformArrayOnParticipants(
  this: void,
  ecsWorld: DecoratedECSWorld,
  participants: Map<string, Participant>,
  transformArray: TransformData[]
) {
  for (let transformData of transformArray) {
    let participantId;
    try {
      participantId = transformData[0];
    } catch (err) {
      console.warn("empty transform data, skipping", transformData);
      continue;
    }
    const participant: Participant = participants.get(participantId);
    if (!participant || participant.isLocal) continue;

    if (!participant.avatar) {
      const position = new Vector3().fromArray(transformData, 1);
      const entities = makeRemoteAvatar(ecsWorld, position, () => {
        return 0;
        // TODO: head angle
      });
      participant.avatar = new Avatar(ecsWorld, entities);
    }
    setTransformDataOnParticipant(participant, transformData);
    if (participant.modified) {
      setAvatarFromParticipant(participant);
      participant.modified = false;
    }
  }
}

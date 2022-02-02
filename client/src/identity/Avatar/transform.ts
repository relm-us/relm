import { Vector3, Euler, AnimationClip } from "three";

import { Transform } from "~/ecs/plugins/core";
import { ModelRef } from "~/ecs/plugins/model";
import { Animation } from "~/ecs/plugins/animation";

import type { TransformData, Participant } from "~/types";
import { Avatar } from "../Avatar";
import { makeRemoteAvatarEntities } from "./makeRemoteAvatarEntities";
import { setAvatarFromParticipant } from "./setAvatarFromParticipant";
import { DecoratedECSWorld } from "types/DecoratedECSWorld";
import { playerId } from "~/identity/playerId";

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
  transformData[5] = participant.avatar?.headAngle;

  const clips: AnimationClip[] = entities.body.get(ModelRef)?.animations;
  const animation: Animation = entities.body.get(Animation);
  if (clips && animation) {
    const index = clips.findIndex((c) => c.name === animation.clipName);
    transformData[6] = index;
    transformData[7] = animation.loop;
  }

  return transformData as TransformData;
}

function setTransformDataOnParticipant(
  this: void,
  participant: Participant,
  [playerId, x, y, z, theta, headTheta, clipIndex, animLoop]: TransformData
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

  // Set position of body
  v1.set(x, y, z);
  if (v1.distanceToSquared(transform.position) > 2) {
    // Teleport over long distances
    transform.position.copy(v1);
  } else {
    // Lerp over short distances
    transform.position.lerp(v1, 0.3333);
  }

  // Set angle of body
  e1.setFromQuaternion(transform.rotation);
  e1.y = theta;
  transform.rotation.setFromEuler(e1);

  // Update physics engine to accept position & rotation transformations
  transform.modified();

  // Set angle of head
  if (participant.avatar) {
    participant.avatar.headAngle = headTheta;
  }

  const clips = entities.body.get(ModelRef)?.animations;
  const animation = entities.body.get(Animation);
  if (clips && clipIndex >= 0 && clipIndex < clips.length) {
    const newClipName = clips[clipIndex].name;
    if (animation.clipName !== newClipName) {
      animation.clipName = newClipName;
      animation.loop = animLoop;
      animation.modified();
    }
  }
}

export function setTransformArrayOnParticipants(
  this: void,
  ecsWorld: DecoratedECSWorld,
  participants: Map<string, Participant>,
  transformArray: TransformData[],
  onAddParticipant: (participant: Participant) => void
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
    if (!participant || participant.participantId === playerId) continue;

    if (!participant.avatar) {
      const position = new Vector3().fromArray(transformData as number[], 1);
      const entities = makeRemoteAvatarEntities(
        ecsWorld,
        position,
        participant.participantId,
        () => {
          return participant.avatar?.headAngle;
        }
      );
      participant.avatar = new Avatar(ecsWorld, entities);

      // Let caller handle anything that should happen when the participant first arrives
      onAddParticipant(participant);
    }
    setTransformDataOnParticipant(participant, transformData);

    // If the remote participant is active (if we've reached this point,
    // they are), and some IdentityData has been modified, then take the
    // opportunity to update the remote participant's label, appearance,
    // etc.
    if (participant.modified) {
      setAvatarFromParticipant(participant);
      participant.modified = false;
    }
  }
}

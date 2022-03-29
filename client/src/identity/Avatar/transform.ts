import { Vector3, Euler, AnimationClip } from "three";

import { Transform } from "~/ecs/plugins/core";
import { ModelRef } from "~/ecs/plugins/model";
import { Animation } from "~/ecs/plugins/animation";

import type { TransformData, AnimationData, Participant } from "~/types";
import { Avatar } from "../Avatar";
import { makeRemoteAvatarEntities } from "./makeRemoteAvatarEntities";
import { setAvatarFromParticipant } from "./setAvatarFromParticipant";
import { DecoratedECSWorld } from "types/DecoratedECSWorld";
import { playerId } from "~/identity/playerId";
import { Oculus } from "~/ecs/plugins/html2d";

const e1 = new Euler(0, 0, 0, "YXZ");
const v1 = new Vector3();

export function avatarToTransformData(
  this: void,
  avatar: Avatar
): TransformData {
  const entities = avatar.entities;
  if (!entities.body) return;

  const transform = entities.body.get(Transform);
  if (!transform) return;

  const transformData: any[] = [];

  // Get position of body
  transform.position.toArray(transformData, 0);

  // Get angle of body
  e1.setFromQuaternion(transform.rotation);
  transformData[3] = e1.y;

  // Get angle of head
  transformData[4] = avatar.headAngle;

  const oculus = entities.body.get(Oculus);
  if (oculus) {
    transformData[7] = oculus.targetOffset.y;
  }

  return transformData as TransformData;
}

export function avatarToAnimationData(
  this: void,
  avatar: Avatar
): AnimationData {
  const entities = avatar.entities;
  if (!entities.body) return;

  const animationData = {
    clipIndex: null,
    animLoop: false,
  };

  const clips: AnimationClip[] = entities.body.get(ModelRef)?.animations;
  const animation: Animation = entities.body.get(Animation);
  if (clips && animation) {
    animationData.clipIndex = clips.findIndex(
      (c) => c.name === animation.clipName
    );
    animationData.animLoop = animation.loop;
  }

  return animationData;
}

function setTransformDataOnAvatar(
  avatar: Avatar,
  [x, y, z, theta, headTheta, oculusOffset]: TransformData
) {
  const entities = avatar.entities;
  if (!entities.body) return;

  const transform = entities.body.get(Transform);
  if (!transform) return;

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
  if (avatar) {
    avatar.headAngle = headTheta;
  }

  const oculus = entities.body.get(Oculus);
  if (oculus) oculus.targetOffset.y = oculusOffset;
}

export function setAnimationDataOnAvatar(
  avatar: Avatar,
  { clipIndex, animLoop }: AnimationData
) {
  const entities = avatar.entities;
  if (!entities.body) return;

  const clips = entities.body.get(ModelRef)?.animations;
  const animation = entities.body.get(Animation);
  if (clips && clipIndex >= 0 && clipIndex < clips.length) {
    const newClipName = clips[clipIndex]?.name;
    if (animation.clipName !== newClipName) {
      animation.clipName = newClipName;
      animation.loop = animLoop;
      animation.modified();
    }
  }
}

export function setDataOnParticipant(
  this: void,
  ecsWorld: DecoratedECSWorld,
  participant: Participant,
  transformData: TransformData,
  animationData: AnimationData,
  onAddParticipant: (participant: Participant) => void
) {
  // Record that we've seen this participant now, so we can know which
  // participants are currently active
  participant.lastSeen = performance.now();

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

  setTransformDataOnAvatar(participant.avatar, transformData);

  if (animationData)
    setAnimationDataOnAvatar(participant.avatar, animationData);

  // If the remote participant is active (if we've reached this point,
  // they are), and some IdentityData has been modified, then take the
  // opportunity to update the remote participant's label, appearance,
  // etc.
  if (participant.modified) {
    setAvatarFromParticipant(participant);
    participant.modified = false;
  }
}

import type { TransformData, AnimationData, Participant, IdentityData } from "~/types";

import { Vector3, Euler, AnimationClip } from "three";
import { Appearance, isEqual } from "relm-common";

import { Transform } from "~/ecs/plugins/core";
import { Model2Ref } from "~/ecs/plugins/form";
import { Animation } from "~/ecs/plugins/animation";

import { Avatar } from "../Avatar";
import { makeRemoteAvatarEntities } from "./makeRemoteAvatarEntities";
import { setAvatarFromParticipant } from "./setAvatarFromParticipant";
import { DecoratedECSWorld } from "types/DecoratedECSWorld";
import { Oculus } from "~/ecs/plugins/html2d";
import { changeAnimationClip } from "./changeAnimationClip";

const e1 = new Euler(0, 0, 0, "YXZ");
const v1 = new Vector3();

export function avatarGetTransformData(
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
    transformData[5] = oculus.targetOffset.y;
  }

  return transformData as TransformData;
}

export function avatarGetAnimationData(
  this: void,
  avatar: Avatar
): AnimationData {
  const entities = avatar.entities;
  if (!entities.body) return;

  const animationData = {
    clipIndex: null,
    animLoop: false,
  };

  const ref: Model2Ref = entities.body.get(Model2Ref);
  const clips: AnimationClip[] = ref?.value?.animations;
  const animation: Animation = entities.body.get(Animation);
  if (clips && animation) {
    animationData.clipIndex = clips.findIndex(
      (c) => c.name === animation.clipName
    );
    animationData.animLoop = animation.loop;
  }

  return animationData;
}

function avatarSetTransformData(
  avatar: Avatar,
  [x, y, z, bodyAngle, headAngle, oculusOffset]: TransformData
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
  e1.y = bodyAngle;
  transform.rotation.setFromEuler(e1);

  // Update physics engine to accept position & rotation transformations
  transform.modified();

  // Set angle of head
  if (avatar) {
    avatar.headAngle = headAngle;
  }

  const oculus = entities.body.get(Oculus);
  if (oculus) oculus.targetOffset.y = oculusOffset;
}

export function avatarSetAnimationData(
  avatar: Avatar,
  { clipIndex, animLoop }: AnimationData
) {
  const entities = avatar.entities;
  if (!entities.body) return;

  const ref: Model2Ref = entities.body.get(Model2Ref);
  const clips = ref?.value.animations;
  if (clips && clipIndex >= 0 && clipIndex < clips.length) {
    const newClipName = clips[clipIndex]?.name;
    changeAnimationClip(entities.body, newClipName, animLoop);
  }
}

export function avatarSetAppearanceData(
  participant: Participant,
  appearance: Appearance
) {
  if (!isEqual(participant.identityData.appearance, appearance)) {
    participant.identityData.appearance = appearance;
    participant.modified = true;
  }
}

export function setDataOnParticipant(
  this: void,
  ecsWorld: DecoratedECSWorld,
  participant: Participant,
  transformData: TransformData,
  animationData: AnimationData,
  identityData: IdentityData,
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

  avatarSetTransformData(participant.avatar, transformData);
  avatarSetAnimationData(participant.avatar, animationData);
  avatarSetAppearanceData(participant, identityData.appearance);

  // If the remote participant is active (if we've reached this point,
  // they are), and some IdentityData has been modified, then take the
  // opportunity to update the remote participant's label, appearance,
  // etc.
  if (participant.modified) {
    setAvatarFromParticipant(participant);
    participant.modified = false;
  }
}

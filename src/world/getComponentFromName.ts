import { WorldTransform, Transform } from "hecs-plugin-core";
import {
  Camera,
  Image,
  LookAt,
  LookAtCamera,
  Model,
  Object3D,
  Shape,
} from "hecs-plugin-three";

// Components from ECS plugins (organized alphabetically by plugin name)
import { CssPlane, HtmlNode } from "~/ecs/plugins/css3d";
import { Follow } from "~/ecs/plugins/follow";
import { DirectionalLight } from "~/ecs/plugins/lighting";
import { NormalizeMesh } from "~/ecs/plugins/normalize";
import { Collider, FixedJoint, RigidBody } from "~/ecs/plugins/rapier";
import { TransformEffects } from "~/ecs/plugins/transform-effects";

export function getComponentFromName(name: string): Function | undefined {
  // prettier-ignore
  switch (name) {
    case "WorldTransform":    return WorldTransform
    case "Transform":         return Transform
    case "Camera":            return Camera
    case "Image":             return Image
    case "LookAt":            return LookAt
    case "LookAtCamera":      return LookAtCamera
    case "Model":             return Model
    case "Object3d":          return Object3D
    case "Shape":             return Shape
    case "CssPlane":          return CssPlane
    case "HtmlNode":          return HtmlNode
    case "Follow":            return Follow
    case "DirectionalLight":  return DirectionalLight
    case "NormalizedMesh":    return NormalizeMesh
    case "Collider":          return Collider
    case "FixedJoint":        return FixedJoint
    case "RigidBody":         return RigidBody
    case "TransformEffects":  return TransformEffects
    default:
      console.error("Unable to getComponentFromName:", name)
  }
}

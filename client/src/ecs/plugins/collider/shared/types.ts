import type { Quaternion, Vector3 } from "three"
import type { Collider3 } from "../components"

export type ColliderParams = {
  spec: Collider3
  offset: Vector3
  rotation: Quaternion
  scale: Vector3
}

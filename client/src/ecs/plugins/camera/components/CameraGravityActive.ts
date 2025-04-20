import { Component } from "~/ecs/base"
import { CameraGravity } from "./CameraGravity"

export class CameraGravityActive extends Component {
  static activator = CameraGravity
}

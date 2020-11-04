import { Component, JSONType } from 'hecs'
import {
  Vector3,
  Vector3Type,
  Quaternion,
  QuaternionType,
} from 'hecs-plugin-core'

/**
 * Provides the "ComposableTransform" of an object. Composes multiple positions,
 * rotations, scales from various effects onto a single entity. Examples:
 * bouncing, shaking, etc.
 */
export class ComposableTransform extends Component {
  static props = {
    position: {
      type: Vector3Type,
      editor: {
        label: 'Position',
      },
    },
    rotation: {
      type: QuaternionType,
      editor: {
        label: 'Rotation',
      },
    },
    scale: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: 'Scale',
      },
    },
    positionOffsets: {
      type: JSONType,
      default: {},
      editor: {
        label: 'Position Offsets',
      },
    },
    rotationOffsets: {
      type: JSONType,
      default: {},
      editor: {
        label: 'Rotation Offsets',
      },
    },
    scaleOffsets: {
      type: JSONType,
      default: {},
      editor: {
        label: 'Scale Offsets',
      },
    },
  }

  offsetPosition(id, position) {
    if (!this.positionOffsets[id]) {
      this.positionOffsets[id] = new Vector3()
      this.hasPositionOffsets = true
    }

    this.positionOffsets[id].copy(position)
  }

  offsetRotation(id, rotation) {
    if (!this.rotationOffsets[id]) {
      this.rotationOffsets[id] = new Quaternion()
      this.hasRotationOffsets = true
    }

    this.rotationOffsets[id].copy(rotation)
  }

  offsetScale(id, scale) {
    if (!this.scaleOffsets[id]) {
      this.scaleOffsets[id] = new Vector3()
      this.hasScaleOffsets = true
    }

    this.scaleOffsets[id].copy(scale)
  }
}

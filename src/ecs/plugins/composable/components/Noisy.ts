import { Component, NumberType, BooleanType } from 'hecs'
import { Vector3, Vector3Type } from 'hecs-plugin-core'

const SpeedMagnitudeProps = {
  speed: {
    type: NumberType,
    default: 1.0,
    editor: {
      label: 'Speed',
    },
  },
  magnitude: {
    type: Vector3Type,
    default: new Vector3(1, 1, 1),
    editor: {
      label: 'Magnitude',
    },
  },
}

export class NoisyPosition extends Component {
  static props = {
    ...SpeedMagnitudeProps,
  }
}

export class NoisyRotation extends Component {
  static props = {
    ...SpeedMagnitudeProps,
  }
}

export class NoisyScale extends Component {
  static props = {
    ...SpeedMagnitudeProps,
    dependent: {
      type: BooleanType,
      default: true,
      editor: {
        label: 'Dependent Variables',
      },
    },
  }
}

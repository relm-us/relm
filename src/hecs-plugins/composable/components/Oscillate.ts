import { Component, NumberType, StringType } from 'hecs'
import {
  Vector3,
  Vector3Type,
  Quaternion,
  QuaternionType,
} from 'hecs-plugin-core'

const BehaviorProp = {
  behavior: {
    type: StringType,
    default: 'OSCILLATE',
    editor: {
      label: 'Oscillate Behavior',
      input: 'Select',
      options: [
        { label: 'Oscillate', value: 'OSCILLATE' },
        { label: 'Bounce', value: 'BOUNCE' },
        { label: 'Bounce/Pause', value: 'BOUNCE_PAUSE' },
      ],
    },
  },
}

const CycleProps = {
  phase: {
    type: NumberType,
    default: 0.0,
    editor: {
      label: 'Starting angle',
    },
  },
  frequency: {
    type: NumberType,
    default: 1.0,
    editor: {
      label: 'Frequency (Hz)',
    },
  },
}

export class OscillatePosition extends Component {
  static props = {
    ...BehaviorProp,
    ...CycleProps,
    min: {
      type: Vector3Type,
      default: new Vector3(0, 0, 0),
      editor: {
        label: 'Direction (min)',
      },
    },
    max: {
      type: Vector3Type,
      default: new Vector3(0, 1, 0),
      editor: {
        label: 'Direction (max)',
      },
    },
  }
}

export class OscillateRotation extends Component {
  static props = {
    ...BehaviorProp,
    ...CycleProps,
    min: {
      type: QuaternionType,
      default: new Quaternion(),
      editor: {
        label: 'Rotation (min)',
      },
    },
    max: {
      type: QuaternionType,
      default: new Quaternion(),
      editor: {
        label: 'Rotation (max)',
      },
    },
  }
}

export class OscillateScale extends Component {
  static props = {
    ...BehaviorProp,
    ...CycleProps,
    min: {
      type: Vector3Type,
      default: new Vector3(1, 1, 1),
      editor: {
        label: 'Scale (min)',
      },
    },
    max: {
      type: Vector3Type,
      default: new Vector3(2, 2, 2),
      editor: {
        label: 'Scale (max)',
      },
    },
  }
}

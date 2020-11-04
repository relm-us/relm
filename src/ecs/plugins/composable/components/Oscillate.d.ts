export type OscillateBehavior = 'OSCILLATE' | 'BOUNCE' | 'BOUNCE_PAUSE'

export class OscillatePosition extends Component {
  behavior: OscillateBehavior
  phase: number
  frequency: number
  min: Vector3
  max: Vector3
}

export class OscillateRotation extends Component {
  behavior: OscillateBehavior
  phase: number
  frequency: number
  min: Quaternion
  max: Quaternion
}

export class OscillateScale extends Component {
  behavior: OscillateBehavior
  phase: number
  frequency: number
  min: Vector3
  max: Vector3
}

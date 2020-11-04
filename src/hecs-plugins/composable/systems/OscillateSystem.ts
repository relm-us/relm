import { System, Groups } from 'hecs'
import { Vector3, Quaternion } from 'hecs-plugin-core'

import { ComposableTransform } from '../components/ComposableTransform'
import {
  OscillatePosition,
  OscillateRotation,
  OscillateScale,
} from '../components/Oscillate'

const position = new Vector3()
const rotation = new Quaternion()
const scale = new Vector3()

export class OscillateSystem extends System {
  order = Groups.Initialization

  static queries = {
    position: [ComposableTransform, OscillatePosition],
    rotation: [ComposableTransform, OscillateRotation],
    scale: [ComposableTransform, OscillateScale],
  }

  init() {
    this.oscillateAngle = 0
  }

  update(timeDelta) {
    this.queries.position.forEach(entity => {
      const spec = entity.get(OscillatePosition)
      const alpha = this.getAlpha(spec.behavior, spec.phase, spec.frequency)
      this.oscillatePosition(entity, alpha, spec.min, spec.max)
    })

    this.queries.rotation.forEach(entity => {
      const spec = entity.get(OscillateRotation)
      const alpha = this.getAlpha(spec.behavior, spec.phase, spec.frequency)
      this.oscillateRotation(entity, alpha, spec.min, spec.max)
    })

    this.queries.scale.forEach(entity => {
      const spec = entity.get(OscillateScale)
      const alpha = this.getAlpha(spec.behavior, spec.phase, spec.frequency)
      this.oscillateScale(entity, alpha, spec.min, spec.max)
    })

    // keep the whole system oscillating
    this.oscillateAngle += (Math.PI * 2) / (1000 / timeDelta)
  }

  // Return a value from 0 to 1 that can be used to lerp
  getAlpha(
    behavior /* OscillateBehavior */,
    phase /* number */,
    frequency /* number */
  ) {
    let alpha,
      angle = (phase + this.oscillateAngle) * frequency

    // Various behaviors
    switch (behavior) {
      case 'OSCILLATE':
        return (Math.cos(angle - Math.PI) + 1) / 2
      case 'BOUNCE':
        return Math.abs(Math.cos((angle - Math.PI) / 2))
      case 'BOUNCE_PAUSE':
        alpha = Math.cos(angle - Math.PI)
        return alpha < 0 ? 0 : alpha
      default:
        throw new Error(`Unknown oscillate behavior: ${behavior}`)
    }
  }

  oscillatePosition(entity, alpha, min, max) {
    position.copy(min).lerp(max, alpha)
    entity.get(ComposableTransform).offsetPosition('oscillate', position)
  }

  oscillateRotation(entity, alpha, min, max) {
    rotation.copy(min).slerp(max, alpha)
    entity.get(ComposableTransform).offsetRotation('oscillate', rotation)
  }

  oscillateScale(entity, alpha, min, max) {
    scale.copy(min).lerp(max, alpha)
    entity.get(ComposableTransform).offsetScale('oscillate', scale)
  }
}

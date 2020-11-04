export class CompositeTransform extends Component {
  position: Vector3
  rotation: Quaternion
  scale: Vector3

  positionOffsets: Record<string, Vector3>
  rotationOffsets: Record<string, Quaternion>
  scaleOffsets: Record<string, Vector3>

  hasPositionOffsets: boolean
  hasRotationOffsets: boolean
  hasScaleOffsets: boolean

  offsetPosition(id: string, position: Vector3): void
  offsetRotation(id: string, rotation: Quaternion): void
  offsetScale(id: string, scale: Vector3): void
}

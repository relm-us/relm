import { Mesh, MeshStandardMaterial, type BufferGeometry, SphereGeometry, Color, type Object3D } from "three"
import { type Entity, System, Groups, Not, Modified } from "~/ecs/base"
import { type Presentation, Object3DRef } from "~/ecs/plugins/core"
import { Diamond, DiamondRef } from "../components"
import { GlowShader } from "../GlowShader"
import diamondGlb from "../diamond.glb"

const PI_THIRDS = Math.PI / 3.0

export class DiamondSystem extends System {
  diamondGeometry: BufferGeometry
  loaded: boolean = false

  order = Groups.Simulation + 1

  presentation: Presentation

  static queries = {
    new: [Diamond, Object3DRef, Not(DiamondRef)],
    modified: [Modified(Diamond), DiamondRef],
    active: [Diamond, DiamondRef],
    removed: [Not(Diamond), DiamondRef],
  }

  init({ presentation }) {
    this.presentation = presentation
    this.presentation.loadGltf(diamondGlb).then((mesh: any) => {
      this.diamondGeometry = mesh.scene.getObjectByName("Diamond").geometry
      this.loaded = true
    })
  }

  update(delta) {
    if (!this.loaded) return

    this.queries.new.forEach((entity) => {
      this.build(entity)
    })
    this.queries.modified.forEach((entity) => {
      this.remove(entity)
      this.build(entity)
    })
    this.queries.active.forEach((entity) => {
      const spec = entity.get(Diamond)
      const ref = entity.get(DiamondRef)
      // Rotate diamonds in step with actual time
      ref.time += spec.speed * Math.PI * delta
      this.setKernelScale(ref.diamond.scale, ref.time)
      this.setDiamondRotation(ref.glow.rotation, ref.time)
    })
    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })
  }

  async build(entity: Entity) {
    const spec = entity.get(Diamond)
    const object3dref: Object3DRef = entity.get(Object3DRef)
    const object3d: Object3D = object3dref.value

    const diamond = this.createKernel(new Color(spec.color))
    if (spec.offset) diamond.position.copy(spec.offset)
    object3d.add(diamond)

    const glow = this.createDiamond()
    if (spec.offset) glow.position.copy(spec.offset)
    object3d.add(glow)

    entity.add(DiamondRef, { diamond, glow })

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    object3dref.modified()
  }

  remove(entity: Entity) {
    const ref = entity.get(DiamondRef)

    const object3dref = entity.get(Object3DRef)

    if (object3dref) {
      const object3d = object3dref.value

      if (ref.diamond) object3d.remove(ref.diamond)
      if (ref.glow) object3d.remove(ref.glow)

      entity.remove(DiamondRef)

      // Notify dependencies, e.g. BoundingBox, that object3d has changed
      object3dref.modified()
    }
  }

  // The small orange "kernel" at the interior of the diamond
  createKernel(color) {
    const material = new MeshStandardMaterial({
      color,
      transparent: true,
    })

    const diamond = new Mesh(this.diamondGeometry, material)
    this.setKernelScale(diamond.scale, 0)
    diamond.rotation.z = Math.PI / 2
    diamond.rotation.x = Math.PI / 8

    return diamond
  }

  setKernelScale(scale, time) {
    scale.x = (10.0 + Math.sin(time + PI_THIRDS * 0) * 3.0) / 200
    scale.y = (12.0 + Math.sin(time + PI_THIRDS * 1) * 3.0) / 200
    scale.z = (14.0 + Math.sin(time + PI_THIRDS * 2) * 3.0) / 200
  }

  // The translucent outer diamond shell
  createDiamond() {
    const geometry = new SphereGeometry(1 / 60, 0, 0)

    const glow = new Mesh(geometry, GlowShader)
    this.setDiamondRotation(glow.rotation, 0)
    glow.scale.set(8, 24, 8)

    return glow
  }

  setDiamondRotation(rotation, time) {
    rotation.y = time / 2.0
  }
}

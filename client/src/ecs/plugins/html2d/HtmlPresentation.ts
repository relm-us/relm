import type { Vector3, PerspectiveCamera } from "three"

export class HtmlPresentation {
  world: any
  camera: PerspectiveCamera
  domElement: HTMLElement
  viewport: HTMLElement

  constructor(world) {
    this.world = world
    this.domElement = this.createDomElement()
    this.camera = this.world.presentation.camera
    if (!this.camera) throw new Error("camera required")
  }

  createDomElement() {
    const el = document.createElement("div")
    el.style.position = "fixed"
    el.style.top = "0px"
    el.style.left = "0px"
    el.style.width = "100%"
    el.style.height = "100%"
    el.style.pointerEvents = "none"

    return el
  }

  /**
   * This function is an optimized equivalent of:
   *
   *   position.project(this.camera);
   *   position.x = ((position.x + 1) * window.innerWidth) / 2;
   *   position.y = (-(position.y - 1) * window.innerHeight) / 2;
   *   position.z = 0;
   */
  project(position: Vector3) {
    let Px = position.x
    let Py = position.y
    let Pz = position.z

    const Ie = this.camera.matrixWorldInverse.elements
    const Iw = Ie[3] * Px + Ie[7] * Py + Ie[11] * Pz + Ie[15]

    const Ix = (Ie[0] * Px + Ie[4] * Py + Ie[8] * Pz + Ie[12]) / Iw
    const Iy = (Ie[1] * Px + Ie[5] * Py + Ie[9] * Pz + Ie[13]) / Iw
    const Iz = (Ie[2] * Px + Ie[6] * Py + Ie[10] * Pz + Ie[14]) / Iw

    const Me = this.camera.projectionMatrix.elements
    const Mw = Me[3] * Ix + Me[7] * Iy + Me[11] * Iz + Me[15]

    const Mx = (Me[0] * Ix + Me[4] * Iy + Me[8] * Iz + Me[12]) / (Mw / window.innerWidth)
    const My = (Me[1] * Ix + Me[5] * Iy + Me[9] * Iz + Me[13]) / (Mw / window.innerHeight)

    position.x = (Mx + window.innerWidth) / 2
    position.y = (-My + window.innerHeight) / 2
    position.z = 0
  }

  createContainer(zIndex = 1) {
    const container = document.createElement("r-html2d")

    // just above the 3d world, but below the editor panel
    container.style.zIndex = zIndex.toString()

    return container
  }

  percent(enumVal) {
    // prettier-ignore
    switch (enumVal) {
      case 0:
        return "0%"
      case 1:
        return "50%"
      case 2:
        return "-50%"
    }
  }

  setViewport(viewport) {
    if (this.viewport === viewport) {
      return
    }
    if (this.viewport) {
      this.viewport.removeChild(this.domElement)
    }
    this.viewport = viewport
    if (this.viewport) {
      this.viewport.appendChild(this.domElement)
    }
  }
}

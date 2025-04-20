import { WebGLRenderer, VSMShadowMap, PCFShadowMap, BasicShadowMap, LinearToneMapping, LinearEncoding } from "three"

import { SHADOW_MAP_TYPE } from "~/config/constants"

export function createRenderer(
  withDefaultStyles = true,
  { antialias = false, stencil = false, depth = false, alpha = true } = {},
) {
  const renderer = new WebGLRenderer({
    powerPreference: "high-performance",
    // Optimized settings for postprocessing composition:
    // (see Presentation.ts)
    antialias,
    stencil,
    depth,
    // necessary for CSS3D
    alpha,
  })

  renderer.info.autoReset = false

  renderer.setClearColor(0x000000, 0.0)
  renderer.toneMapping = LinearToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.physicallyCorrectLights = true
  renderer.shadowMap.enabled = true
  renderer.outputEncoding = LinearEncoding
  switch (SHADOW_MAP_TYPE) {
    case "BASIC":
      renderer.shadowMap.type = BasicShadowMap
      break
    case "PCF":
      renderer.shadowMap.type = PCFShadowMap
      break
    case "VSM":
      renderer.shadowMap.type = VSMShadowMap
      break
  }

  if (withDefaultStyles) {
    const style = renderer.domElement.style
    style.outline = "0"
    style.position = "absolute"
    style.pointerEvents = "none"
    style.zIndex = "1"
  }

  renderer.domElement.addEventListener("webglcontextlost", () => {
    console.log("relm says webgl context is lost")
  })

  renderer.domElement.addEventListener("webglcontextrestored", () => {
    console.log("relm says webgl context is restored")
  })

  return renderer
}

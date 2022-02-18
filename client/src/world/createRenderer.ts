import {
  WebGLRenderer,
  VSMShadowMap,
  PCFShadowMap,
  BasicShadowMap,
  LinearToneMapping,
  LinearEncoding,
} from "three";

import { SHADOW_MAP_TYPE } from "~/config/constants";

export function createRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    stencil: false,
    powerPreference: "high-performance",
  });

  // renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000, 0.0);
  renderer.toneMapping = LinearToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = LinearEncoding;
  switch (SHADOW_MAP_TYPE) {
    case "BASIC":
      renderer.shadowMap.type = BasicShadowMap;
      break;
    case "PCF":
      renderer.shadowMap.type = PCFShadowMap;
      break;
    case "VSM":
      renderer.shadowMap.type = VSMShadowMap;
      break;
  }

  const style = renderer.domElement.style;
  style.outline = "0";
  style.position = "absolute";
  style.pointerEvents = "none";
  style.zIndex = "1";

  return renderer;
}

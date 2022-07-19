import { Scene, FogExp2, Color, AmbientLight, HemisphereLight } from "three";

export function createScene() {
  const scene = new Scene();
  scene.background = new Color(0xaec7ed);
  scene.name = "Relm Scene";

  scene.fog = new FogExp2(0xe5e0dd, 0.022);

  const hemiLight = new HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(hemiLight);

  const ambientLight = new AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  return scene;
}

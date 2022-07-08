import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const loader = new GLTFLoader();

export class Loader {
  loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  async load(path): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      loader.load(path, (data) => resolve(data), null, reject);
    });
  }
}

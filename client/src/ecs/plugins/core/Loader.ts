import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

/**
 * GLTFLoader isn't quite supported in node.js so this
 * is a bit of hack to make it usable
 *
 * 1. load() tries to use XMLHttpRequest which doesn't exist
 *    on node. Instead we just load it ourself using fetch
 *    with is available in browsers, and polyfilled on node.
 *    It is then sent through parse() manually.
 * 2. parse() tries to call atob() on the result which node
 *    does not have. We polyfill this too.
 */

export class Loader {
  loader: GLTFLoader;
  cache: object;

  constructor() {
    this.loader = new GLTFLoader();
    this.cache = {};
  }

  async load(path) {
    let promise = this.cache[path];
    if (!promise) {
      promise = this.cache[path] = new Promise(async (resolve, reject) => {
        const response = await fetch(path);
        const buffer = await response.arrayBuffer();
        try {
          this.loader.parse(
            buffer,
            null,
            (gltf) => resolve({ scene: gltf.scene, clips: gltf.animations }),
            (error) => reject(error)
          );
        } catch (err) {
          reject(err);
        }
      });
    }
    const loaded = await promise;
    return { scene: SkeletonUtils.clone(loaded.scene), clips: loaded.clips };
  }
}

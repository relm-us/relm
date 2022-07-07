import {
  Matrix4,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
} from "three";

/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 */

const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();

class CSS3DObject extends Object3D {
  isCSS3DObject: boolean;
  element: HTMLElement;

  constructor(element = document.createElement("div")) {
    super();

    this.isCSS3DObject = true;

    this.element = element;
    this.element.style.position = "absolute";
    this.element.style.pointerEvents = "auto";
    this.element.style.userSelect = "none";

    this.element.setAttribute("draggable", false as any);

    this.addEventListener("removed", function () {
      this.traverse(function (object) {
        if (
          object.element instanceof Element &&
          object.element.parentNode !== null
        ) {
          object.element.parentNode.removeChild(object.element);
        }
      });
    });
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    this.element = source.element.cloneNode(true);

    return this;
  }
}

class CSS3DSprite extends CSS3DObject {
  isCSS3DSprite: boolean;
  rotation2D: number;

  constructor(element) {
    super(element);

    this.isCSS3DSprite = true;

    this.rotation2D = 0;
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    this.rotation2D = source.rotation2D;

    return this;
  }
}

//

const _matrix = new Matrix4();
const _matrix2 = new Matrix4();

class CSS3DRenderer {
  getSize: () => void;
  setSize: (width: number, height: number) => void;
  render: (
    scene: Scene,
    camera:
      | (PerspectiveCamera & {
          isOrthographicCamera: false;
          isPerspectiveCamera: true;
        })
      | (OrthographicCamera & {
          isOrthographicCamera: true;
          isPerspectiveCamera: false;
          top: number;
          right: number;
          bottom: number;
          left: number;
        })
  ) => void;
  domElement: HTMLElement;

  constructor(parameters: any = {}) {
    const _this = this;

    let _width, _height;
    let _widthHalf, _heightHalf;

    const cache = {
      camera: { fov: 0, style: "" },
      objects: new WeakMap(),
    };

    const domElement =
      parameters.element !== undefined
        ? parameters.element
        : document.createElement("div");

    domElement.style.overflow = "hidden";

    this.domElement = domElement;

    const cameraElement = document.createElement("div");

    cameraElement.style.transformStyle = "preserve-3d";
    cameraElement.style.pointerEvents = "none";

    domElement.appendChild(cameraElement);

    this.getSize = function () {
      return {
        width: _width,
        height: _height,
      };
    };

    this.render = function (scene, camera) {
      const fov = camera.projectionMatrix.elements[5] * _heightHalf;

      if (cache.camera.fov !== fov) {
        domElement.style.perspective = camera.isPerspectiveCamera
          ? fov + "px"
          : "";
        cache.camera.fov = fov;
      }

      if (scene.autoUpdate === true) scene.updateMatrixWorld();
      if (camera.parent === null) camera.updateMatrixWorld();

      let tx, ty;

      if (camera.isOrthographicCamera) {
        tx = -(camera.right + camera.left) / 2;
        ty = (camera.top + camera.bottom) / 2;
      }

      // prettier-ignore
      const cameraCSSMatrix = camera.isOrthographicCamera
        ? "scale(" + fov + ")" +
          "translate(" + epsilon(tx) + "px," + epsilon(ty) + "px)" +
          getCameraCSSMatrix(camera.matrixWorldInverse)
        : "translateZ(" + fov + "px)" +
          getCameraCSSMatrix(camera.matrixWorldInverse);

      const style =
        cameraCSSMatrix +
        "translate(" +
        _widthHalf +
        "px," +
        _heightHalf +
        "px)";

      if (cache.camera.style !== style) {
        cameraElement.style.transform = style;

        cache.camera.style = style;
      }

      renderObject(scene, scene, camera, cameraCSSMatrix);
    };

    this.setSize = function (width, height) {
      _width = width;
      _height = height;
      _widthHalf = _width / 2;
      _heightHalf = _height / 2;

      domElement.style.width = width + "px";
      domElement.style.height = height + "px";

      cameraElement.style.width = width + "px";
      cameraElement.style.height = height + "px";
    };

    function epsilon(value) {
      // return Math.abs(value) < 1e-10 ? 0 : value;
      return value.toFixed(2);
    }

    function getCameraCSSMatrix(matrix) {
      const el = matrix.elements;

      // prettier-ignore
      return (
        "matrix3d(" +
          epsilon(el[0]) + "," + epsilon(-el[1]) + "," + epsilon(el[2]) + "," + epsilon(el[3]) + "," +
          epsilon(el[4]) + "," + epsilon(-el[5]) + "," + epsilon(el[6]) + "," + epsilon(el[7]) + "," +
          epsilon(el[8]) + "," + epsilon(-el[9]) + "," + epsilon(el[10]) + "," + epsilon(el[11]) + "," +
          epsilon(el[12]) + "," + epsilon(-el[13]) + "," + epsilon(el[14]) + "," + epsilon(el[15]) +
        ")"
      );
    }

    function getObjectCSSMatrix(matrix) {
      const el = matrix.elements;

      // prettier-ignore
      const matrix3d =
        "matrix3d(" +
          epsilon(el[0]) + "," + epsilon(el[1]) + "," + epsilon(el[2]) + "," + epsilon(el[3]) + "," +
          epsilon(-el[4]) + "," + epsilon(-el[5]) + "," + epsilon(-el[6]) + "," + epsilon(-el[7]) + "," +
          epsilon(el[8]) + "," + epsilon(el[9]) + "," + epsilon(el[10]) + "," + epsilon(el[11]) + "," +
          epsilon(el[12]) + "," + epsilon(el[13]) + "," + epsilon(el[14]) + "," + epsilon(el[15]) +
        ")";

      return "translate(-50%,-50%)" + matrix3d;
    }

    function renderObject(object, scene, camera, cameraCSSMatrix) {
      if (object.isCSS3DObject) {
        const visible =
          object.visible === true && object.layers.test(camera.layers) === true;
        object.element.style.display = visible === true ? "" : "none";

        if (visible === true) {
          object.onBeforeRender(_this, scene, camera);

          let style;

          if (object.isCSS3DSprite) {
            // http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

            _matrix.copy(camera.matrixWorldInverse);
            _matrix.transpose();

            if (object.rotation2D !== 0)
              _matrix.multiply(_matrix2.makeRotationZ(object.rotation2D));

            object.matrixWorld.decompose(_position, _quaternion, _scale);
            _matrix.setPosition(_position);
            _matrix.scale(_scale);

            _matrix.elements[3] = 0;
            _matrix.elements[7] = 0;
            _matrix.elements[11] = 0;
            _matrix.elements[15] = 1;

            style = getObjectCSSMatrix(_matrix);
          } else {
            style = getObjectCSSMatrix(object.matrixWorld);
          }

          const element = object.element;
          const cachedObject = cache.objects.get(object);

          if (cachedObject === undefined || cachedObject.style !== style) {
            element.style.transform = style;

            const objectData = { style: style };
            cache.objects.set(object, objectData);
          }

          if (element.parentNode !== cameraElement) {
            cameraElement.appendChild(element);
          }

          object.onAfterRender(_this, scene, camera);
        }
      }

      for (let i = 0, l = object.children.length; i < l; i++) {
        renderObject(object.children[i], scene, camera, cameraCSSMatrix);
      }
    }
  }
}

export { CSS3DObject, CSS3DSprite, CSS3DRenderer };

<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import { OutlineEffect } from "three/examples/jsm/effects/OutlineEffect";

  import { WireframeGeometry2 } from "three/examples/jsm/lines/WireframeGeometry2";
  import { Wireframe } from "three/examples/jsm/lines/Wireframe";
  import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
  import { EdgesGeometry } from "three";

  const SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;
  const scene = new THREE.Scene();
  const VIEW_ANGLE = 45,
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
    NEAR = 0.1,
    FAR = 20000;
  const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0, 150, 400);
  camera.lookAt(scene.position);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  const effect = new OutlineEffect(renderer, { defaultThickness: 0.02 });

  function init() {
    const container = document.body;
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);

    // LIGHT
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, 150, 100);
    scene.add(light);
    // FLOOR
    var floorMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
    });
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    ////////////
    // CUSTOM //
    ////////////

    var material = new THREE.MeshNormalMaterial();

    var sphereGeometry = new THREE.SphereGeometry(50, 32, 16);
    var sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.set(-60, 55, 0);
    scene.add(sphere);

    // var outlineMaterial1 = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    //   side: THREE.BackSide,
    // });
    // var outlineMesh1 = new THREE.Mesh(sphereGeometry, outlineMaterial1);
    // outlineMesh1.position.copy(sphere.position);
    // outlineMesh1.scale.multiplyScalar(1.05);
    // scene.add(outlineMesh1);

    var cubeGeometry = new THREE.BoxGeometry(80, 80, 80);
    var cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.set(0, 60, 0);
    // scene.add(cube);

    // var outlineMaterial3 = new THREE.LineBasicMaterial({ color: 0x990099 });
    var outlineMaterial3 = new LineMaterial({
      color: 0xff00ff,
      linewidth: 4,
    });
    // var outlineMesh3 = new THREE.Mesh(cubeGeometry, material);
    var edges = new THREE.EdgesGeometry(cubeGeometry);
    var outlineMesh3 = new THREE.Line(edges, outlineMaterial3);
    outlineMesh3.position.copy(cube.position);
    outlineMesh3.scale.multiplyScalar(1.05);
    scene.add(outlineMesh3);

    // var outlineMaterial2 = new THREE.MeshBasicMaterial({
    //   color: 0x00ff00,
    //   side: THREE.BackSide,
    // });
    // var outlineMesh2 = new THREE.Mesh(cubeGeometry, outlineMaterial2);
    // outlineMesh2.position.copy(cube.position);
    // outlineMesh2.scale.multiplyScalar(1.05);
    // scene.add(outlineMesh2);
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    // effect.render(scene, camera);
  }

  onMount(() => {
    init();
    animate();
  });
</script>

import {
  Vector3,
  Mesh,
  Group,
  PlaneGeometry,
  MeshBasicMaterial,
  Line,
  LineBasicMaterial,
  BufferGeometry,
  DoubleSide,
} from "three";

export function makeDragPlaneHelper(size = 3, height = 3, opacity = 0.25) {
  const group = new Group();

  const planeGeometry = new PlaneGeometry(size, size, 1, 1);
  const planeMaterial = new MeshBasicMaterial({
    color: 0xff0000,
    side: DoubleSide,
    transparent: true,
    opacity,
  });
  const plane = new Mesh(planeGeometry, planeMaterial);
  group.add(plane);

  for (const x of [-size / 2, 0, size / 2]) {
    for (const y of [-size / 2, 0, size / 2]) {
      const lineMaterial = new LineBasicMaterial({
        color: 0xffffff,
      });

      const lineGeometry = new BufferGeometry().setFromPoints([
        new Vector3(x, y, -height / 2),
        new Vector3(x, y, height / 2),
      ]);

      const line = new Line(lineGeometry, lineMaterial);
      group.add(line);
    }
  }
  
  return group;
}

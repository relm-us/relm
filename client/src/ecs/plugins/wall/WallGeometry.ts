import { BufferGeometry, Float32BufferAttribute, CubicBezierCurve3, Vector3, MathUtils } from "three"

function validateWallArgs(width, height, depth, N) {
  if (width <= 0) {
    console.warn("wall width must be greater than 0", width)
    return false
  }
  if (height <= 0) {
    console.warn("wall height must be greater than 0", height)
    return false
  }
  if (depth <= 0) {
    console.warn("wall depth must be greater than 0", depth)
    return false
  }
  if (N < 1) {
    console.warn("WallGeometry requries N >= 1")
    return false
  }
  return true
}

export function wallGeometryData(width = 2, height = 2, depth = 0.25, convexity = 0, N = 6) {
  if (!validateWallArgs(width, height, depth, N)) return

  convexity = MathUtils.clamp(convexity, -1, 1)

  // Make sure N is an integer
  N = Math.floor(N)

  const normals = []
  const vertices = []
  const indices = []

  const controlPoint = (w) => {
    const divisor = 3.5
    return new Vector3(w / divisor, 0, convexity * Math.abs(w) * 0.6)
  }

  // The central curve is not drawn, but guides the inner and outer curves
  const centerCurve = new CubicBezierCurve3(
    new Vector3(-width / 2, 0, 0),
    controlPoint(-width),
    controlPoint(width),
    new Vector3(width / 2, 0, 0),
  )

  const getCurvePoints = (curve: CubicBezierCurve3): Array<Vector3> => {
    const points: Array<Vector3> = []
    for (let i = 0; i <= N; i++) {
      const u = i / N
      points.push(curve.getPointAt(u))
    }
    return points
  }

  const centerCurvePoints = getCurvePoints(centerCurve)

  // Lines orthogonal to start and end points are used to abutt the walls
  const up = new Vector3(0, 1, 0)
  const orthoStart = new Vector3().copy(centerCurvePoints[1]).sub(centerCurvePoints[0]).cross(up).normalize()
  const orthoEnd = new Vector3()
    .copy(centerCurvePoints[N])
    .sub(centerCurvePoints[N - 1])
    .cross(up)
    .normalize()

  const createCurve = (d: number): CubicBezierCurve3 => {
    const plus = new Vector3(0, 0, d / (1 - Math.abs(convexity) / 3.5))
    return new CubicBezierCurve3(
      new Vector3().copy(orthoStart).multiplyScalar(d).add(centerCurvePoints[0]),
      controlPoint(-width).add(plus),
      controlPoint(width).add(plus),
      new Vector3().copy(orthoEnd).multiplyScalar(d).add(centerCurvePoints[N]),
    )
  }

  const innerCurve = createCurve(-depth / 2)
  const innerCurvePoints = getCurvePoints(innerCurve)
  const outerCurve = createCurve(depth / 2)
  const outerCurvePoints = getCurvePoints(outerCurve)

  const makeCurveSkin = (curve, clockwise) => {
    const start = vertices.length / 3
    for (let i = 0; i <= N; i++) {
      const p = curve[i]
      for (let y = 0; y <= height; y += height) {
        vertices.push(p.x, y, p.z)
        normals.push(p.x, y, p.z)
      }

      if (i > 0) {
        let p1 = start + i * 2 + 0
        let p2 = start + i * 2 + 1
        let p3 = start + (i - 1) * 2 + 0
        let p4 = start + (i - 1) * 2 + 1

        /**
         *          + p2
         *         /|
         *        / |
         *       /  |
         *      /   |
         *  p3 +----+ p1
         */
        if (clockwise) indices.push(p1, p2, p3)
        else indices.push(p1, p3, p2)

        /**
         *  p4 +----+ p2
         *     |   /
         *     |  /
         *     | /
         *     |/
         *  p3 +
         */
        if (clockwise) indices.push(p3, p2, p4)
        else indices.push(p3, p4, p2)
      }
    }
  }

  makeCurveSkin(innerCurvePoints, false)
  makeCurveSkin(outerCurvePoints, true)

  // Build the top of the wall
  const topStart = vertices.length / 3
  for (let i = 0; i <= N; i++) {
    const pInner = innerCurvePoints[i]
    vertices.push(pInner.x, height, pInner.z)
    normals.push(0, 1, 0)

    const pOuter = outerCurvePoints[i]
    vertices.push(pOuter.x, height, pOuter.z)
    normals.push(0, 1, 0)

    if (i > 0) {
      let p1 = topStart + i * 2 + 0
      let p2 = topStart + i * 2 + 1
      let p3 = topStart + (i - 1) * 2 + 0
      let p4 = topStart + (i - 1) * 2 + 1
      indices.push(p1, p3, p2)
      indices.push(p3, p4, p2)
    }
  }

  // Build ends of the wall
  const endStart1 = vertices.length / 3
  const nx1 = centerCurvePoints[1].x - centerCurvePoints[0].x
  const nz1 = centerCurvePoints[1].z - centerCurvePoints[0].z
  const addNormal1 = () => normals.push(nx1, 0, nz1)
  vertices.push(innerCurvePoints[0].x, 0, innerCurvePoints[0].z)
  addNormal1()
  vertices.push(innerCurvePoints[0].x, height, innerCurvePoints[0].z)
  addNormal1()
  vertices.push(outerCurvePoints[0].x, 0, outerCurvePoints[0].z)
  addNormal1()
  vertices.push(outerCurvePoints[0].x, height, outerCurvePoints[0].z)
  addNormal1()
  indices.push(endStart1, endStart1 + 2, endStart1 + 1)
  indices.push(endStart1 + 2, endStart1 + 3, endStart1 + 1)

  const endStart2 = vertices.length / 3
  const nx2 = centerCurvePoints[N - 1].x - centerCurvePoints[N].x
  const nz2 = centerCurvePoints[N - 1].z - centerCurvePoints[N].z
  const addNormal2 = () => normals.push(nx2, 0, nz2)
  vertices.push(innerCurvePoints[N].x, 0, innerCurvePoints[N].z)
  addNormal2()
  vertices.push(innerCurvePoints[N].x, height, innerCurvePoints[N].z)
  addNormal2()
  vertices.push(outerCurvePoints[N].x, 0, outerCurvePoints[N].z)
  addNormal2()
  vertices.push(outerCurvePoints[N].x, height, outerCurvePoints[N].z)
  addNormal2()
  indices.push(endStart2, endStart2 + 1, endStart2 + 2)
  indices.push(endStart2 + 2, endStart2 + 1, endStart2 + 3)

  return { vertices, normals, indices }
}

export function WallGeometry(width = 2, height = 2, depth = 0.25, convexity = 0, N = 6) {
  const geometry = new BufferGeometry()

  const { vertices, normals, indices } = wallGeometryData(width, height, depth, convexity, N)
  geometry.setIndex(indices)
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3))
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3))
  // geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()

  return geometry
}

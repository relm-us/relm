import { Color, MeshStandardMaterial } from "three"

export const colliderMaterial = new MeshStandardMaterial({
  color: new Color("#333333"),
  roughness: 0.5,
  metalness: 0.5,
  emissive: new Color("#333333"),
  transparent: true,
  opacity: 0.5,
})

export const sensorMaterial = new MeshStandardMaterial({
  color: new Color("#339933"),
  roughness: 0.5,
  metalness: 0.5,
  emissive: new Color("#333333"),
  transparent: true,
  opacity: 0.5,
})

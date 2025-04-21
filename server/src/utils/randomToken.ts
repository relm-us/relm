import { uuidv4 } from "../utils/index.js"

export function randomToken() {
  return uuidv4().split("-")[0]
}

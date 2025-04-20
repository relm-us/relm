import type { SavedIdentityData } from "relm-common"

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = LoginCredentials & {
  identity: SavedIdentityData
}

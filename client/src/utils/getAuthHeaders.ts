import type { AuthenticationHeaders } from "relm-common"

import { participantId } from "~/identity/participantId"
import { security } from "~/stores/security"

export async function getAuthHeaders() {
  const pubkey = await security.exportPublicKey()
  const signature = await security.sign(participantId)

  const authHeaders: AuthenticationHeaders = {
    "x-relm-participant-id": participantId,
    "x-relm-participant-sig": signature,
    "x-relm-pubkey-x": pubkey.x,
    "x-relm-pubkey-y": pubkey.y,
  }

  return authHeaders
}

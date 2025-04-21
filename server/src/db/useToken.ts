import { config } from "../config.js"
import { useInvitation } from "./invitation.js"
import { setPermits } from "./permission.js"

export async function useToken({ token, relmId, participantId }) {
  if (token && token.length <= config.MAX_TOKEN_LENGTH) {
    const invite = await useInvitation({
      token,
      relmId,
      participantId,
    })

    // Convert invitation to permissions
    await setPermits({
      participantId,
      relmId,
      permits: [...invite.permits],
    })

    console.log(
      `Participant ${participantId} used token ${token} to enter ${relmId} with permits ${JSON.stringify(
        invite.permits,
      )}`,
    )

    return invite
  }

  return null
}

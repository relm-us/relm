import { MAX_TOKEN_LENGTH } from "../config.js";
import { useInvitation } from "./invitation.js";
import { setPermits } from "./permission.js";

export async function useToken({ token, relmId, playerId }) {
  if (token && token.length <= MAX_TOKEN_LENGTH) {
    const invite = await useInvitation({
      token,
      relmId,
      playerId,
    });

    // Convert invitation to permissions
    await setPermits({
      playerId,
      relmId: invite.relmId,
      permits: [...invite.permits],
    });

    console.log(
      `Participant ${playerId} used token ${token} to enter ${relmId} with permits ${JSON.stringify(
        invite.permits
      )}`
    );

    return invite;
  }

  return null;
}

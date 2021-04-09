import { MAX_TOKEN_LENGTH } from "../config";
import { useInvitation } from "./invitation";
import { setPermissions } from "./permission";

export async function useToken({ token, relmId, playerId }) {
  if (token && token.length <= MAX_TOKEN_LENGTH) {
    const invite = await useInvitation({
      token,
      relmId,
      playerId,
    });

    // Convert invitation to permissions
    await setPermissions({
      playerId,
      relmId: invite.relmId,
      permits: [...invite.permits],
    });

    return invite;
  }

  return null;
}

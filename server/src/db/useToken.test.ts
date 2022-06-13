import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';

import { useToken } from "./useToken.js";
import { createInvitation } from "./invitation.js";
import { getPermissions } from "./permission.js";
import { init, deinit } from "./db.js";
import { uuidv4 } from "../utils/index.js";
import { createRelm } from "./relm.js";

describe("useToken", () => {
  beforeAll(init);
  afterAll(deinit);

  it("for invitation", async () => {
    const token = uuidv4(); // token can be anything, we just need something unique for testing
    const relmId = uuidv4();
    const participantId = uuidv4();

    // Relm must exist for getPermissions to return a result
    await createRelm({ relmId, relmName: relmId, isPublic: false });

    const invitation = await createInvitation({
      token,
      relmId,
      maxUses: 1,
      permits: ["access"],
    });
    expect(invitation.used).toEqual(0);

    const usedInvitation = await useToken({
      token,
      relmId,
      participantId,
    });
    expect(usedInvitation.used).toEqual(1);

    const permitsByRelm = await getPermissions({
      participantId,
      relmIds: [relmId],
    });
    const permits = permitsByRelm[relmId];
    expect(permits).toEqual(["access"]);
  });
});

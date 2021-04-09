import { useToken } from "./useToken";
import { createInvitation } from "./invitation";
import { getPermissions } from "./permission";
import { init, deinit } from "./db";
import { uuidv4 } from "../util";

describe("useToken", () => {
  beforeAll(init);
  afterAll(deinit);

  it("for invitation", async () => {
    const token = uuidv4(); // token can be anything, we just need something unique for testing
    const relmId = uuidv4();
    const playerId = uuidv4();
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
      playerId,
    });
    expect(usedInvitation.used).toEqual(1);

    const permits = await getPermissions({
      relmId,
      playerId,
    });
    expect(permits).toEqual(new Set(["access"]));
  });
});

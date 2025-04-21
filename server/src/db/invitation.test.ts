import { describe, expect, beforeAll, afterAll, it } from "@jest/globals"

import * as Invitation from "./invitation.js"
import { init, deinit } from "./db.js"
import { uuidv4 } from "../utils/index.js"

describe("Invitation model tests", () => {
  beforeAll(init)
  afterAll(deinit)

  it("creates invitation", async () => {
    const relmId = uuidv4()
    const participantId = uuidv4()
    const token = uuidv4()
    const invitation = await Invitation.createInvitation({
      relmId,
      permits: ["access"],
      token: token,
      createdBy: participantId,
    })
    expect(invitation.token).toEqual(token)

    // check that the invitation can be retrieved
    const invite = await Invitation.getInvitation({
      token,
      relmId,
    })
    expect(invite.createdBy).toEqual(participantId)
    expect(invite.permits).toEqual(new Set(["access"]))
    expect(invite.relmId).toEqual(relmId)
    expect(invite.maxUses).toEqual(1)
    expect(invite.used).toEqual(0)

    // confirm we can't create another invitation with the same token
    await expect(Invitation.createInvitation({ token })).rejects.toThrow(
      `duplicate key value violates unique constraint "invitations_pkey"`,
    )
  })

  it("uses an invitation", async () => {
    const relmId = uuidv4()
    const participantId = uuidv4()
    const token = uuidv4()
    const invitation = await Invitation.createInvitation({
      token: token,
      relmId,
      permits: ["access"],
      createdBy: participantId,
    })
    expect(invitation.token).toEqual(token)

    // using it a 1st time should return the invitation
    const invite = await Invitation.useInvitation({
      token,
      relmId,
    })
    expect(invite.maxUses).toEqual(1)
    expect(invite.used).toEqual(1)

    // using it a 2nd time should throw
    await expect(Invitation.useInvitation({ token, relmId })).rejects.toThrow("invitation no longer valid")
  })
})

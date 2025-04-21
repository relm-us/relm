import { afterAll, beforeAll, describe, expect, it } from "@jest/globals"
import { deinit, init } from "./db.js"

import * as SocialConnection from "./socialConnection.js"
import * as User from "./user.js"

describe("Social connection model tests", () => {
  beforeAll(init)
  afterAll(deinit)

  // All tests require this user created.
  let userId
  beforeAll(async () => {
    userId = await User.createUser({
      email: "example-social@example.com",
      password: "example",
    })
  })

  it("Registers a social connection", async () => {
    await SocialConnection.registerSocial({
      social: "register",
      profileId: "test id",
      userId,
    })

    const isConnected = await SocialConnection.isUserConnectedViaSocial({
      social: "register",
      userId,
    })
    const isNotConnected = await SocialConnection.isUserConnectedViaSocial({
      social: "not register",
      userId,
    })

    expect(isConnected).toBeTruthy()
    expect(isNotConnected).toBeFalsy()
  })

  it("Fetches a user by their social connection", async () => {
    await SocialConnection.registerSocial({
      social: "fetch",
      profileId: "test id",
      userId,
    })

    const fetchedSocialId = await SocialConnection.getUserIdBySocial({
      social: "fetch",
      profileId: "test id",
    })

    expect(fetchedSocialId).toEqual(userId)
  })
})

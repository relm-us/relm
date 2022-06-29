import { describe, expect, beforeAll, afterAll, it } from "@jest/globals";

import * as User from "./user.js";

import { init, deinit } from "./db.js";

describe("User model tests", () => {
  beforeAll(init);
  afterAll(deinit);

  const defaultUserData = {
    email: "example@example.com",
    password: "example password"
  };

  it("creates a user", async () => {
    await User.createUser(defaultUserData);

    const userId = await User.getUserIdByEmail({
      email: defaultUserData.email
    });

    expect(userId).not.toBeNull();
  });

  it("signs in successfully with the correct credentials", async () => {
    const successfullyLoggedIn = await User.verifyCredentials(defaultUserData);
    const shouldBeFailedLogin = await User.verifyCredentials({
      email: "example@example.com",
      password: ""
    });

    expect(successfullyLoggedIn).toBeTruthy();
    expect(shouldBeFailedLogin).toBeFalsy();
  });
});
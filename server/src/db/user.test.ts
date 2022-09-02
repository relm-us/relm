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

    const userId = await User.getUserIdByLoginId({
      email: defaultUserData.email
    });

    expect(userId).not.toBeNull();
  });

  it("fails to create a user with an invalid email", async () => {
    // The left must exist
    await expect(User.createUser({
      email: "@domain.com",
      password: "example password"
    })).rejects.toThrow();

    // The right side needs at least 3 characters
    await expect(User.createUser({
      email: "left@.",
      password: "example password"
    })).rejects.toThrow();

    // An @ must be present
    await expect(User.createUser({
      email: "email",
      password: "example password"
    })).rejects.toThrow();
  });

  it("signs in successfully with the correct credentials", async () => {
    const successfullyLoggedIn = await User.verifyEmailPassword(defaultUserData);
    const shouldBeFailedLogin = await User.verifyEmailPassword({
      email: "example@example.com",
      password: ""
    });

    expect(successfullyLoggedIn).toBeTruthy();
    expect(shouldBeFailedLogin).toBeFalsy();
  });
});
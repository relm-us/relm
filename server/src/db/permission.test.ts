import * as Permission from "./permission";

import { uuidv4 } from "../utils";
import { init, deinit } from "./db";

const welcomeRelmId = uuidv4()

describe("Permission model tests", () => {
  beforeAll(init);
  afterAll(deinit);

  it("filteredPermits", () => {
    expect(Permission.filteredPermits(["access", "xyz"])).toEqual(
      new Set(["access"])
    );
    expect(
      Permission.filteredPermits(["admin", "access", "invite", "edit"])
    ).toEqual(new Set(["admin", "access", "invite", "edit"]));
  });

  it("sets permissions", async () => {
    const playerId = uuidv4();
    const setPermits = await Permission.setPermissions({
      playerId,
      relmId: welcomeRelmId,
    });
    expect(setPermits).toEqual(new Set(["access"]));

    const permits = await Permission.getPermissions({
      playerId,
      relmId: welcomeRelmId,
    });
    expect(permits).toEqual(new Set(["access"]));
  });

  it("unions permissions", async () => {
    const playerId = uuidv4();
    await Permission.setPermissions({
      playerId,
      relmId: null,
      permits: ["access"],
    });
    await Permission.setPermissions({
      playerId,
      relmId: welcomeRelmId,
      permits: ["admin"],
    });

    const permits = await Permission.getPermissions({
      playerId,
      relmId: welcomeRelmId,
    });
    expect(permits).toEqual(new Set(["access", "admin"]));
  });
});

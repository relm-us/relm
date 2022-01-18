import * as Permission from "./permission";

import { uuidv4 } from "../utils";
import { init, deinit } from "./db";
import { Relm } from ".";

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

  it("gets access permission to public relm", async () => {
    const playerId = uuidv4();
    const relmId = uuidv4();
    const relmName = uuidv4();

    await Relm.createRelm({
      relmId,
      relmName,
      isPublic: true,
    });

    const permitsByRelm = await Permission.getPermissions({
      playerId,
      relmNames: [relmName, "doesnotexist"],
    });

    expect(permitsByRelm["*"]).not.toBeDefined();
    expect(permitsByRelm[relmName]).toEqual(["access"]);

    // We requested a relm that doesn't exist, so permissions should be empty
    expect(permitsByRelm["doesnotexist"]).toEqual([]);
  });

  it("gets union of permits that includes wildcard relm", async () => {
    const playerId = uuidv4();
    const relmId1 = uuidv4();
    const relmName1 = uuidv4();
    const relmId2 = uuidv4();
    const relmName2 = uuidv4();

    await Relm.createRelm({
      relmId: relmId1,
      relmName: relmName1,
      isPublic: false,
    });
    await Relm.createRelm({
      relmId: relmId2,
      relmName: relmName2,
      isPublic: false,
    });

    // Wildcard permits for this participant
    await Permission.setPermissions({
      playerId,
      relmId: null,
      permits: ["admin"],
    });

    // Relm-specific permits for this participant
    await Permission.setPermissions({
      playerId,
      relmId: relmId1,
      permits: ["access", "edit"],
    });
    await Permission.setPermissions({
      playerId,
      relmId: relmId2,
      permits: ["access"],
    });

    const permitsByRelm = await Permission.getPermissions({
      playerId,
      relmNames: [relmName1, relmName2],
    });

    expect(Object.keys(permitsByRelm).sort()).toEqual(
      ["*", relmName1, relmName2].sort()
    );

    expect(permitsByRelm["*"]).toEqual(["admin"]);
    expect(permitsByRelm[relmName1].sort()).toEqual(
      ["admin", "access", "edit"].sort()
    );
    expect(permitsByRelm[relmName2].sort()).toEqual(["admin", "access"].sort());
  });

  it("sets permissions", async () => {
    const playerId = uuidv4();
    const relmId1 = uuidv4();
    const relmName1 = uuidv4();

    await Relm.createRelm({
      relmId: relmId1,
      relmName: relmName1,
      isPublic: false,
    });

    for (let permit of ["access", "invite", "edit"]) {
      await Permission.setPermissions({
        playerId,
        relmId: relmId1,
        permits: [permit as Permission.Permission],
        union: false,
      });
    }

    const permitsByRelm = await Permission.getPermissions({
      playerId,
      relmNames: [relmName1],
    });

    expect(permitsByRelm[relmName1].sort()).toEqual(["edit"].sort());
  });

  it("sets unioned permissions", async () => {
    const playerId = uuidv4();
    const relmId1 = uuidv4();
    const relmName1 = uuidv4();

    await Relm.createRelm({
      relmId: relmId1,
      relmName: relmName1,
      isPublic: false,
    });

    for (let permit of ["access", "invite", "invite"]) {
      await Permission.setPermissions({
        playerId,
        relmId: relmId1,
        permits: [permit as Permission.Permission],
      });
    }

    const permitsByRelm = await Permission.getPermissions({
      playerId,
      relmNames: [relmName1],
    });

    expect(permitsByRelm[relmName1].sort()).toEqual(
      ["access", "invite"].sort()
    );
  });
});

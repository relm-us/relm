import { describe, expect, beforeAll, afterAll, it } from "@jest/globals";

import * as Permission from "./permission.js";

import { uuidv4 } from "../utils/index.js";
import { init, deinit } from "./db.js";
import { Relm } from "./index.js";

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
    const participantId = uuidv4();
    const relmId = uuidv4();
    const relmName = uuidv4();

    await Relm.createRelm({
      relmId,
      relmName,
      publicPermits: ["access"],
    });

    const permitsByRelm = await Permission.getPermissions({
      participantId,
      relmNames: [relmName, "doesnotexist"],
    });

    expect(permitsByRelm["*"]).not.toBeDefined();
    expect(permitsByRelm[relmName]).toEqual(["access"]);

    // We requested a relm that doesn't exist, so permissions should be empty
    expect(permitsByRelm["doesnotexist"]).toEqual([]);
  });

  it("getPermissions returns multiple permits including wildcard relm", async () => {
    const participantId = uuidv4();
    const relmId1 = uuidv4();
    const relmName1 = uuidv4();
    const relmId2 = uuidv4();
    const relmName2 = uuidv4();

    await Relm.createRelm({
      relmId: relmId1,
      relmName: relmName1,
    });
    await Relm.createRelm({
      relmId: relmId2,
      relmName: relmName2,
    });

    // Wildcard permits for this participant
    await Permission.setPermits({
      participantId,
      relmId: null,
      permits: ["admin"],
    });

    // Relm-specific permits for this participant
    await Permission.setPermits({
      participantId,
      relmId: relmId1,
      permits: ["access", "edit"],
    });
    await Permission.setPermits({
      participantId,
      relmName: relmName2,
      permits: ["access"],
    });

    const permitsByRelm = await Permission.getPermissions({
      participantId,
      relmNames: [relmName1, relmName2],
    });

    expect(Object.keys(permitsByRelm).sort()).toEqual(
      ["*", relmName1, relmName2].sort()
    );

    expect(permitsByRelm["*"]).toEqual(["admin"]);
    expect(permitsByRelm[relmName1].sort()).toEqual(["access", "edit"].sort());
    expect(permitsByRelm[relmName2].sort()).toEqual(["access"].sort());
  });

  it("sets permissions", async () => {
    const participantId = uuidv4();
    const relmId1 = uuidv4();
    const relmName1 = uuidv4();

    await Relm.createRelm({
      relmId: relmId1,
      relmName: relmName1,
    });

    for (let permit of ["access", "invite", "edit"]) {
      await Permission.setPermits({
        participantId,
        relmId: relmId1,
        permits: [permit as Permission.Permission],
        union: false,
      });
    }

    const permitsByRelm = await Permission.getPermissions({
      participantId,
      relmNames: [relmName1],
    });

    expect(permitsByRelm[relmName1].sort()).toEqual(["edit"].sort());
  });

  it("sets unioned permissions", async () => {
    const participantId = uuidv4();
    const relmId1 = uuidv4();
    const relmName1 = uuidv4();

    await Relm.createRelm({
      relmId: relmId1,
      relmName: relmName1,
    });

    for (let permit of ["access", "invite", "invite"]) {
      await Permission.setPermits({
        participantId,
        relmId: relmId1,
        permits: [permit as Permission.Permission],
      });
    }

    const permitsByRelm = await Permission.getPermissions({
      participantId,
      relmNames: [relmName1],
    });

    expect(permitsByRelm[relmName1].sort()).toEqual(
      ["access", "invite"].sort()
    );
  });
});

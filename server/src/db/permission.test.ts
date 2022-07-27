import { describe, expect, beforeAll, afterAll, it } from "@jest/globals";

import * as Permission from "./permission.js";

import { uuidv4 } from "../utils/index.js";
import { init, deinit } from "./db.js";
import { Participant, Relm, User } from "./index.js";

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

  it("checks permissions of all related participants of user id", async () => {
    const participantId = uuidv4();
    const participantId2 = uuidv4();
    const participantId3 = uuidv4();
    const participantId4 = uuidv4();
    const relmId = uuidv4();

    await Relm.createRelm({
      relmId,
      relmName: uuidv4(),
    });

    await Participant.addPubKeyDoc({
      participantId,
      pubKeyDoc: {
        example: 0
      }
    });
    await Participant.addPubKeyDoc({
      participantId: participantId2,
      pubKeyDoc: {
        example: 1
      }
    });

    await Permission.setPermits({
      participantId,
      relmId: null,
      permits: ["access"]
    });
    await Permission.setPermits({
      participantId: participantId2,
      relmId: relmId,
      permits: ["admin"]
    });

    const { userId } = await User.createUser({
      email: "example-permissions@example.com",
      password: "example"
    });

    await Participant.assignToUserId({ participantId, userId });
    await Participant.assignToUserId({ participantId: participantId2, userId });

    // Check that participant2 has the global "access" permission
    const globalPermissionsOfP2 = await Permission.getPermissions({
      participantId: participantId2,
      relmIds: [ relmId ]
    });
    expect(globalPermissionsOfP2["*"]).toEqual(["access"]);

    // Check that participant1 has the relm "admin" permission
    const relmPermissionsOfP = await Permission.getPermissions({
      participantId,
      relmIds: [ relmId ]
    });
    expect(relmPermissionsOfP[relmId]).toEqual(["admin"]);


    // Try it again with participants who are NOT associated with a user.
    // Ensure that users who do not have a user associated do not look up the permissions of other users
    // who do not have a user associated.
    await Permission.setPermits({
      participantId: participantId3,
      relmId: null,
      permits: ["access"]
    });
    await Permission.setPermits({
      participantId: participantId4,
      relmId,
      permits: ["admin"]
    });

    // P4 should NOT have any global permissions
    const globalPermissionsOfP4 = await Permission.getPermissions({
      participantId: participantId4
    });
    expect(globalPermissionsOfP4["*"]).toEqual(undefined);
    
    // P3 should NOT have any relm permissions
    const relmPermissionsOfP3 = await Permission.getPermissions({
      participantId: participantId3
    });
    expect(relmPermissionsOfP3[relmId]).toEqual(undefined);


  });
});

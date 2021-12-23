import * as Permission from "./permission";

import { uuidv4 } from "../utils";
import { init, deinit } from "./db";
import { Relm } from ".";

const welcomeRelmId = uuidv4();

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

  it("gets acccess permission to public relm", async () => {
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
      relmNames: [relmName],
    });

    expect(permitsByRelm["*"]).toEqual([]);
    expect(permitsByRelm[relmName]).toEqual(["access"]);
  });

  it("gets unioned permissions", async () => {
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

    // Wildcard permission for this user
    await Permission.setPermissions({
      playerId,
      relmId: null,
      permits: ["admin"],
    });
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
});

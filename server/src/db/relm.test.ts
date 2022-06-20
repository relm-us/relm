import { describe, expect, beforeAll, afterAll, it } from "@jest/globals";

import * as Relm from "./relm.js";

import { init, deinit } from "./db.js";
import { uuidv4, UUID_RE } from "../utils/index.js";

describe("Relm model tests", () => {
  beforeAll(init);
  afterAll(deinit);

  it("Gets all public relms", async () => {
    const pubPrefix = uuidv4();
    const relmName1 = pubPrefix + uuidv4();
    const relmName2 = pubPrefix + uuidv4();
    const relmName3 = uuidv4();
    await Relm.createRelm({
      relmName: relmName1,
      publicPermits: ["access"],
    });
    await Relm.createRelm({
      relmName: relmName2,
      publicPermits: ["access"],
    });
    await Relm.createRelm({ relmName: relmName3 });
    const relms = await Relm.getAllRelms({
      prefix: pubPrefix,
      isPublic: true,
      includeEmpty: true,
    });
    const relmNames = new Set(relms.map((r) => r.relmName));
    expect(relmNames).toEqual(new Set([relmName1, relmName2]));
  });

  it("Creates a relm with defaults", async () => {
    const relmName = "relm-being-created-" + uuidv4();
    const relm = await Relm.createRelm({ relmName });
    expect(relm).toEqual({
      relmId: expect.stringMatching(UUID_RE),
      seedRelmId: null,
      relmName,
      publicPermits: [],
      clonePermitAssigned: null,
      clonePermitRequired: null,
      createdBy: null,
      createdAt: expect.any(Date),
      permanentDocId: expect.stringMatching(UUID_RE),
    });
  });

  it("Gets a relm by relmName", async () => {
    const relmName = "relm-with-name-" + uuidv4();
    await Relm.createRelm({ relmName });
    const relm = await Relm.getRelm({ relmName });
    expect(relm.relmName).toEqual(relmName);
    expect(relm.permanentDocId).toBeDefined();
  });

  it("Gets a relm by relmId", async () => {
    const relmId = uuidv4();
    const relmName = "relm-with-id-" + uuidv4();
    await Relm.createRelm({ relmId, relmName });
    const relm = await Relm.getRelm({ relmId });
    expect(relm.relmName).toEqual(relmName);
  });

  it("Updates a relm", async () => {
    const relmName = "relm-being-updated-" + uuidv4();
    const createdRelm = await Relm.createRelm({ relmName });

    const updatedRelmName = "relm-has-been-updated-" + uuidv4();
    const relm = await Relm.updateRelm({
      relmId: createdRelm.relmId,
      relmName: updatedRelmName,
      publicPermits: ["access"],
    });

    expect(relm.publicPermits).toEqual(["access"]);
    expect(relm.relmName).toEqual(updatedRelmName);
  });
});

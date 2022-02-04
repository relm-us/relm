import * as Asset from "./asset";

import { init, deinit } from "./db";
import { uuidv4, UUID_RE } from "../utils";

describe("Asset model tests", () => {
  beforeAll(init);
  afterAll(deinit);

  it("queryAssets", async () => {
    await Asset.deleteAllAssets();

    await Asset.createAsset({ name: "test has words", tags: ["one"] });
    await Asset.createAsset({ name: "test without", tags: ["two"] });
    await Asset.createAsset({ name: "second tag", tags: ["two", "three"] });
    const query = Asset.queryAssets;

    const r1 = await query({ keywords: ["test", "words"] });
    expect(r1.length).toEqual(1);
    expect(r1[0].name).toEqual("test has words");

    const r2 = await query({ tags: ["two"] });
    expect(r2.length).toEqual(2);
    expect(r2[0].name).toEqual("second tag");
    expect(r2[1].name).toEqual("test without");
  });
});

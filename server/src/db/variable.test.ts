import * as Variable from "./variable";

import { init, deinit } from "./db";
import { uuidv4, UUID_RE } from "../utils";

describe("Variable model tests", () => {
  beforeAll(init);
  afterAll(deinit);

  it("get/set variable", async () => {
    const relmId = uuidv4();
    const name = uuidv4();
    await Variable.setVariable({
      relmId,
      name,
      value: "hi",
      description: "greeting",
    });

    const variable = await Variable.getVariable({ relmId, name });
    expect(variable).toEqual({
      relmId,
      name,
      value: "hi",
      description: "greeting",
      createdBy: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it("getVariables", async () => {
    const relmId = uuidv4();

    const name1 = uuidv4();
    await Variable.setVariable({ relmId, name: name1, value: "hi" });
    const name2 = uuidv4();
    await Variable.setVariable({ relmId, name: name2, value: 1 });

    const vars = await Variable.getVariables({ relmId });

    expect(vars).toEqual({ [name1]: "hi", [name2]: 1 });
  });
});

import { describe, expect, beforeAll, afterAll, it } from "@jest/globals"

import * as Variable from "./variable.js"

import { init, deinit } from "./db.js"
import { uuidv4 } from "../utils/index.js"

describe("Variable model tests", () => {
  beforeAll(init)
  afterAll(deinit)

  it("get/set variable", async () => {
    const relmId = uuidv4()
    const name = uuidv4()
    await Variable.setVariable({
      relmId,
      name,
      value: { greeting: "hi" },
      description: "greeting",
    })

    const variable = await Variable.getVariable({ relmId, name })
    expect(variable).toEqual({
      relmId,
      name,
      value: { greeting: "hi" },
      description: "greeting",
      createdBy: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })

  it("getVariables", async () => {
    const relmId = uuidv4()

    const name1 = uuidv4()
    await Variable.setVariable({ relmId, name: name1, value: null })
    const name2 = uuidv4()
    await Variable.setVariable({ relmId, name: name2, value: 1 })
    const name3 = uuidv4()
    await Variable.setVariable({ relmId, name: name3, value: "test" })

    const vars = await Variable.getVariables({ relmId })

    expect(vars).toEqual({ [name1]: null, [name2]: 1, [name3]: "test" })
  })
})

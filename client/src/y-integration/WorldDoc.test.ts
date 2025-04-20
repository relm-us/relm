import * as Y from "yjs"
import { WorldDoc } from "./WorldDoc"
import { World } from "~/ecs/base"
import CorePlugin from "~/ecs/plugins/core"

function keepYDocsInSync(ydoc1, ydoc2) {
  ydoc1.on("update", (update) => {
    Y.applyUpdate(ydoc2, update)
  })

  ydoc2.on("update", (update) => {
    Y.applyUpdate(ydoc1, update)
  })
}

describe("WorldDoc", () => {
  let wdoc1: WorldDoc
  let wdoc2: WorldDoc

  beforeEach(() => {
    wdoc1 = new WorldDoc(new World({ plugins: [CorePlugin] }) as any)
    wdoc2 = new WorldDoc(new World({ plugins: [CorePlugin] }) as any)

    keepYDocsInSync(wdoc1.ydoc, wdoc2.ydoc)
  })

  test("initializes", () => {
    expect(wdoc1.world).toBeDefined()
  })

  test("add Entity", () => {
    const entity = wdoc1.world.entities.create("e1")
    wdoc1.syncFrom(entity)
    expect(wdoc1.entities.length).toEqual(1)
  })

  describe("observer", () => {
    test("onAdd Entity", (done) => {
      const e1 = wdoc1.world.entities.create("e1")

      wdoc2.on("entities.added", () => {
        expect(wdoc2.entities.toJSON()).toEqual([
          {
            id: "0:0",
            name: "e1",
            parent: null,
            children: [],
            meta: {},
            components: [],
          },
        ])

        done()
      })

      wdoc1.syncFrom(e1)
    })

    test("yids and hids", (done) => {
      const e1 = wdoc1.world.entities.create("e1")

      wdoc2.on("entities.added", () => {
        const yentityId = wdoc2.entities.get(0)._item.id
        const yids = new Map()
        yids.set(`${yentityId.client}-${yentityId.clock}`, "0:0")
        expect(wdoc2.yids).toEqual(yids)

        const hids = new Map()
        hids.set("0:0", wdoc2.entities.get(0))
        expect(wdoc2.hids).toEqual(hids)

        done()
      })

      wdoc1.syncFrom(e1)
    })
  })
})

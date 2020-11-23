import { WorldDoc } from "./WorldDoc";
import { World } from "hecs";
import CorePlugin from "hecs-plugin-core";

describe("WorldDoc", () => {
  let wdoc: WorldDoc;

  beforeEach(() => {
    const world = new World({ plugins: [CorePlugin] });
    wdoc = new WorldDoc("test-world", world);
  });

  test("initializes", () => {
    expect(wdoc.name).toEqual("test-world");
  });

  test("add Entity", () => {
    const entity = wdoc.world.entities.create("e1");
    wdoc.add(entity);
    expect(wdoc.entities.length).toEqual(1);
  });

  describe("observer", () => {
    let world;

    beforeEach(() => {
      world = new World({ plugins: [CorePlugin] });
    });

    test("onAdd Entity", (done) => {
      const e1 = world.entities.create("e1");
      wdoc.on("entities.added", () => {
        expect(wdoc.entities.toJSON()).toEqual([
          {
            id: "0:0",
            name: "e1",
            parent: null,
            children: [],
            meta: {},
            components: [],
          },
        ]);

        done();
      });

      wdoc.add(e1);
    });

    test("yids and hids", (done) => {
      const e1 = world.entities.create("e1");
      wdoc.on("entities.added", () => {
        const yentityId = wdoc.entities.get(0)._item.id;
        const yids = new Map();
        yids.set(`${yentityId.client}-${yentityId.clock}`, "0:0");
        expect(wdoc.yids).toEqual(yids);

        const hids = new Map();
        hids.set("0:0", wdoc.entities.get(0));
        expect(wdoc.hids).toEqual(hids);

        done();
      });

      wdoc.add(e1);
    });
  });
});

import { WorldDoc } from "./y-integration";
import { World } from "hecs";
import CorePlugin, {
  WorldTransform,
  Transform,
  Vector3,
} from "hecs-plugin-core";

function subscribeSkipInitial(store, callback) {
  let count = 0;
  return store.subscribe((value) => {
    if (count++ > 0) {
      callback(value);
    }
  });
}

describe("WorldDoc", () => {
  let world;
  let doc: WorldDoc;
  beforeEach(() => {
    world = new World({ plugins: [CorePlugin] });
    doc = new WorldDoc("test-doc", world);
  });

  test("create a WorldDoc", () => {
    expect(doc.name).toEqual("test-doc");
  });
  /*
  test("create an entity and add to WorldDoc", (done) => {
    subscribeSkipInitial(doc.entities, (value) => {
      expect(value.length).toEqual(1);
      expect(value[0].get("name")).toEqual("test-entity");
      expect(value[0].get("components").toJSON()).toEqual([]);
      done();
    });

    const entity = doc.create("test-entity").build();
    expect(entity.get("name")).toEqual("test-entity");
  });

  test("builder syntax", () => {
    const yentity = doc
      .create("Box-1")
      .add(Transform, {
        position: new Vector3(1, 2, 3),
      })
      .build();

    expect(yentity.get("components").length).toEqual(1);
  });

  test("adding to the WorldDoc generates entity in ECS", (done) => {
    doc.on("entities.added", () => {
      expect(world.entities.entities.size).toEqual(1);
      const entity = world.entities.entities.values().next().value;
      const pos = entity.get(Transform).position;
      expect(pos.x).toEqual(1);
      expect(pos.y).toEqual(2);
      expect(pos.z).toEqual(3);
      done();
    });

    doc.on("entities.deleted", () => {});

    doc
      .create("Build-1")
      .add(Transform, {
        position: new Vector3(1, 2, 3),
        scale: new Vector3(2, 2, 2),
      })
      .build();
  });

  test("deleting from WorldDoc removes in ECS", (done) => {
    let yentity;

    doc.on("entities.added", () => {
      expect(world.entities.entities.size).toEqual(1);
    });

    doc.on("entities.deleted", (id) => {
      expect(world.entities.entities.size).toEqual(0);
      done();
    });

    yentity = doc
      .create("Build-2")
      .add(Transform, {
        position: new Vector3(1, 2, 3),
        scale: new Vector3(2, 2, 2),
      })
      .build();
    doc.destroy(yentity._item.id);
  });

  test("add component", (done) => {
    const yentity = doc
      .create("Box-1")
      .add(Transform, {
        position: new Vector3(1, 2, 3),
      })
      .build();

    expect(yentity.get("components").length).toEqual(1);

    doc.on("components.added", () => {
      console.log("test component added");
      expect(world.entities.entities.size).toEqual(1);
      const entity = world.entities.entities.values().next().value;
      expect(entity.components.size).toEqual(2);
      done();
    });

    const yId = yentity._item.id;
    console.log("YEntity ID", yId);
    doc.addComponent(yId, WorldTransform, {
      position: new Vector3(1, 0, 0),
    });
  });
  */
});

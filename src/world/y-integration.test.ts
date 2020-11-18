import { WorldDoc, EntityElement, ComponentElement } from "./y-integration";
import { World } from "hecs";

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
  let doc;
  beforeEach(() => {
    world = new World();
    doc = new WorldDoc("test", world);
  });

  test("create a WorldDoc", () => {
    expect(doc.name).toEqual("test");
  });

  test("create an entity and add to WorldDoc", (done) => {
    subscribeSkipInitial(doc.entities, (value) => {
      expect(value.length).toEqual(1);
      expect(value[0].name).toEqual("test-entity");
      expect(value[0].components.toJSON()).toEqual([]);
      done();
    });

    const entity = doc.create("test-entity");
    expect(entity.name).toEqual("test-entity");
  });
});

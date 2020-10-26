import {
  World,
  System,
  Component,
  StateComponent,
  Not,
  Modified,
  StringType,
  RefType,
} from "hecs";

import ThreePlugin from "hecs-plugin-three";

const exampleMeshes = {
  // These would normally be objects in memory that have whatever
  // data is needed for the Mesh to be rendered by an engine like
  // three.js, babylon.js, etc.
  basketball: {
    description: "a ball and its pretend mesh data",
    dispose: () => {
      console.log("basketball mesh disposed");
    },
  },
};

class Model extends Component {
  static props = {
    type: StringType,
  };
}

class Mesh extends StateComponent {
  static props = {
    value: RefType,
  };
}

class ModelSystem extends System {
  static queries = {
    added: [Model, Not(Mesh)],
    modified: [Modified(Model), Mesh],
    removed: [Not(Model), Mesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      const model = entity.get(Model);
      const object3d = exampleMeshes[model.type];
      entity.add(Mesh, { value: object3d });
    });
    this.queries.modified.forEach((entity) => {
      entity.remove(Mesh);
      const model = entity.get(Model);
      const object3d = exampleMeshes[model.type];
      entity.add(Mesh, { value: object3d });
    });
    this.queries.removed.forEach((entity) => {
      const object3d = entity.get(Mesh).value;
      object3d.dispose();
      entity.remove(Mesh);
    });
  }
}

const world = new World({
  plugins: [ThreePlugin],
  systems: [ModelSystem],
  components: [Model, Mesh],
});

// Create an entity
// const entity = world.entities.create();

// // Add our custom `Model` component with its required `type` property
// entity.add(Model, { type: "basketball" }).activate();

// // ... then, to demonstrate queries in ModelSystem, destroy the entity 3 seconds later
// setTimeout(() => {
//   entity.destroy();
// }, 3000);

// function update() {
//   world.update();
//   requestAnimationFrame(update);
// }

// update();

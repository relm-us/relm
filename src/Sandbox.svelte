<script lang="ts">
  import * as Y from "yjs";
  (window as any).Y = Y;

  const ydoc = new Y.Doc();

  type YEntities = Y.Array<YEntity>;
  type YEntity = Y.Map<string | YComponents>;
  type YComponents = Y.Array<YComponent>;
  type YComponent = Y.Map<string | YValues>;
  type YValues = Y.Map<YValue>;
  type YValue = boolean | number | string | object | Array<YValue>;

  type YMapChange = {
    action: "add" | "update" | "delete";
    oldValue: any;
  };

  function yIdToHecsId(yId) {
    return `${yId.client}-${yId.clock}`;
  }

  function hecsIdToYId(hecsId) {
    const parts = hecsId.split("-");
    return { client: parts[0], clock: parts[1] };
  }

  function observeYEntities(event) {
    console.log("observeYEntities", event);
    for (const item of event.changes.added) {
      for (const yentity of item.content.getContent()) {
        console.log("yentity.observe", yentity._item.id);
        yentity.observe(observeYEntity);
        console.log("  added:", yentity._item.id, yentity.toJSON());
      }
    }
    for (const item of event.changes.deleted) {
      console.log("  deleted", item.id, item);
    }
  }

  function observeYEntity(event) {
    console.log("observeYEntity", event);
    for (const key of event.keysChanged) {
      const value: string | YComponents = event.target.get(key);
      const change: YMapChange = event.changes.keys.get(key);
      console.log("  keyChanged:", key, "->", value, change);
      if (key === "components") {
        const ycomponents = value as YComponents;
        switch (change.action) {
          case "add":
            console.log("ycomponents.observe", ycomponents._item.id);
            ycomponents.observe(observeYComponents);
            break;
          case "update":
            console.log("ycomponents.unobserve", change.oldValue._item.id);
            change.oldValue.unobserve(observeYComponents);
            console.log("ycomponents.observe", ycomponents._item.id);
            ycomponents.observe(observeYComponents);
            break;
          case "delete":
            console.log("ycomponents.unobserve", change.oldValue._item.id);
            change.oldValue.unobserve(observeYComponents);
            break;
        }
      }
    }
  }

  function observeYComponents(event) {
    console.log("observeYComponents", event);
    for (const item of event.changes.added) {
      for (const ycomponent of item.content.getContent()) {
        ycomponent.observe(observeYComponent);
        console.log("  added:", ycomponent._item.id, ycomponent.toJSON());
      }
    }
    for (const item of event.changes.deleted) {
      console.log("  deleted", item.id);
    }
  }

  function observeYComponent(event) {
    console.log("observeYComponent", event);
    for (const key of event.keysChanged) {
      const value: string | YValues = event.target.get(key);
      const change: YMapChange = event.changes.keys.get(key);
      console.log("  keyChanged:", key, "->", value, change);
      if (key === "components") {
        const yvalues = value as YValues;
        switch (change.action) {
          case "add":
            yvalues.observe(observeYValues);
            break;
          case "update":
            change.oldValue.unobserve(observeYValues);
            yvalues.observe(observeYValues);
            break;
          case "delete":
            change.oldValue.unobserve(observeYValues);
            break;
        }
      }
    }
  }

  function observeYValues(event) {
    console.log("observeYValues", event);
    for (const key of event.keysChanged) {
      const value: string | YValues = event.target.get(key);
      const change: YMapChange = event.changes.keys.get(key);
      console.log("  keyChanged:", key, "->", value, change);
    }
  }

  const entities: YEntities = ydoc.getArray("entities");
  entities.observe(observeYEntities);
  (window as any).entities = entities;

  let entity: YEntity;
  let c1values: YValues;
  let c2values: YValues;

  ydoc.transact(() => {
    for (let i = 0; i < 2; i++) {
      entity = new Y.Map();
      // entity.observe(observeEntity)

      entities.push([entity]);

      entity.set("name", `Box-${i}`);

      const components: Y.Array<YComponent> = new Y.Array();
      // components.observe(observeComponents);

      entity.set("components", components);

      const component1: YComponent = new Y.Map();
      // component1.observe(observeComponent)
      {
        component1.set("name", "Transform");

        c1values = new Y.Map();
        // c1values.observe(observeProperties)

        component1.set("values", c1values);

        c1values.set("position", [1, 2, 3]);
        c1values.set("scale", [1, 1, 1]);
      }

      const component2: YComponent = new Y.Map();
      // component2.observe(observeComponent)
      {
        component2.set("name", "Shape");

        c2values = new Y.Map();
        // c2values.observe(observeProperties)

        component2.set("values", c2values);

        c2values.set("kind", "BOX");
        c2values.set("boxSize", [1, 2, 1]);
      }

      components.push([component1, component2]);

      // entities.delete(0, 1);
    }
  }, "testOrigin");

  // entity.set("name2", "NewName");
  // entity.delete("name");
  // entities.delete(0, 1);
  entity.set("name", "NewName");
  c2values.set("kind", "SPHERE");
</script>

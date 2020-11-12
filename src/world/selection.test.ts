import { createGroupTree } from "./selection";

test("group root of entity without a group should be null", () => {
  const tree = createGroupTree();
  expect(tree.getRoot("0:1")).toEqual(null);
});

test("group root of entity with a group (one tier)", () => {
  const tree = createGroupTree();
  tree.addEntity("0:1", "group1");
  expect(tree.getRoot("0:1")).toEqual("group1");
});

test("group root of entity with a group (two tiers)", () => {
  const tree = createGroupTree();
  tree.addEntity("0:1", "mid-group");
  tree.addGroup("mid-group", "top-group");
  expect(tree.getRoot("0:1")).toEqual("top-group");
});

test("tree entities (single tier)", () => {
  const tree = createGroupTree();
  tree.addEntity("0:1", "group1");
  tree.addEntity("0:2", "group1");
  expect(tree.getEntitiesInGroup("group1")).toEqual(new Set(["0:1", "0:2"]));
});

test("tree entities (two tiers)", () => {
  const tree = createGroupTree();
  tree.addEntity("0:1", "group1");
  tree.addEntity("0:2", "group1");
  tree.addEntity("0:3", "group2");
  tree.addEntity("0:4", "group2");
  tree.addEntity("0:5", "group3");
  tree.addGroup("group1", "group-of-groups");
  tree.addGroup("group2", "group-of-groups");
  expect(tree.getEntitiesInGroup("group1")).toEqual(new Set(["0:1", "0:2"]));
  expect(tree.getEntitiesInGroup("group2")).toEqual(new Set(["0:3", "0:4"]));
  expect(tree.getEntitiesInGroup("group3")).toEqual(new Set(["0:5"]));
  expect(tree.getEntitiesInGroup("group-of-groups")).toEqual(
    new Set(["0:1", "0:2", "0:3", "0:4"])
  );
});

test("make a group", () => {
  const tree = createGroupTree();
  tree.makeGroup(["0:1", "0:2", "0:3"], "g1");
  expect(tree.getEntitiesInGroup("g1")).toEqual(new Set(["0:1", "0:2", "0:3"]));
});

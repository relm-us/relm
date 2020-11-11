<script lang="ts">
  import Button from "../Button";
  import { store as world } from "~/world/store";
  import { Quaternion, Euler } from "three";
  import { OscillateRotation } from "~/ecs/plugins/composable";
  import { Outline } from "~/ecs/plugins/outline";
  import { findEntity } from "~/ecs/utils";
  import { makePileOfBoxes } from "~/world/prefab";
  const action = () => {
    // const entity = findEntity($world, (entity) => entity.name === "Chair");
    // entity.add(OscillateRotation, {
    //   cycles: 1.5,
    //   phase: Math.PI / 2,
    //   frequency: 4,
    //   min: new Quaternion().setFromEuler(new Euler(0, -Math.PI / 4, 0)),
    //   max: new Quaternion().setFromEuler(new Euler(0, Math.PI / 4, 0)),
    // });

    // if (entity.has(Outline)) {
    //   entity.remove(Outline);
    // } else {
    //   entity.add(Outline);
    // }

    makePileOfBoxes($world, { count: 10 });
  };
</script>

<Button on:click={action}>Action</Button>

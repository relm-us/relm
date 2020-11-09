<script lang="ts">
  import Button from "../Button";
  import { store as world } from "~/world/store";
  import { Quaternion, Euler } from "three";
  import { OscillateRotation } from "~/ecs/plugins/composable";

  function findEntity(filter) {
    if (!$world) return null;

    for (const [id, entity] of $world.entities.entities) {
      if (filter(entity)) return entity;
    }

    return null;
  }

  const action = () => {
    const entity = findEntity((entity) => entity.name === "BlueBox");
    entity.add(OscillateRotation, {
      cycles: 1.5,
      phase: Math.PI / 2,
      frequency: 4,
      min: new Quaternion().setFromEuler(new Euler(0, -Math.PI / 4, 0)),
      max: new Quaternion().setFromEuler(new Euler(0, Math.PI / 4, 0)),
    });
  };
</script>

<Button on:click={action}>Action</Button>

import { Quaternion, Vector3 } from "three";
import { cleanLink } from "~/utils/cleanLink";

import { worldManager } from "~/world";
import { System, Groups, Entity } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";

import { AudioZone, AudioZoneEntered } from "../components";
import { Impact } from "~/ecs/plugins/physics";

export class AudioZoneSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization;

  static queries = {
    boundary: [AudioZone, Impact],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.boundary.forEach((entity) => {
      const impact: Impact = entity.get(Impact);
      const enteredYet = entity.has(AudioZoneEntered);

      if (impact.started && !enteredYet) {
        this.enterAudioZone(entity);
      } else if (!impact.started && enteredYet) {
        this.leaveAudioZone(entity);
      }
    });
    }

  enterAudioZone(entity: Entity) {
    const spec = entity.get(AudioZone);
    console.log("Entered audio zone:", spec.zone);
    entity.add(AudioZoneEntered, { zone: spec.zone });

    worldManager.dispatch({ id: "rejoinAudioVideo", zone: spec.zone });
  }

  leaveAudioZone(entity: Entity) {
    console.log("Left audio zone:", entity.get(AudioZone).zone);
    entity.remove(AudioZoneEntered);

    worldManager.dispatch({ id: "rejoinAudioVideo", zone: null });
  }
}

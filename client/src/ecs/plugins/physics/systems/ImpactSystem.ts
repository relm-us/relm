import { System, Groups} from "~/ecs/base";
import { Impact, RigidBodyRef } from "../components";
import { Physics } from "../Physics";

type Entity = any;
type Magnitude = number;
type OtherContacts = Map<Entity, Magnitude>;

export class ImpactSystem extends System {
  physics: Physics;

  order = Groups.Simulation;

  static queries = {
    impacts: [Impact],
  };

  init({ physics }) {
    this.physics = physics;
  }

  update() {
    // Impact components last just one cycle; clean up old ones
    this.queries.impacts.forEach((entity) => {
      entity.remove(Impact);
    });

    // Add single-cycle Impact component for each collision
    const contacts = this.getContacts();
    for (const [entity, others] of contacts) {
      entity.add(Impact, { others });
    }
  }

  getContacts(): Map<Entity, OtherContacts> {
    const { eventQueue } = this.physics;

    const contacts: Map<Entity, OtherContacts> = new Map();

    const getOtherContacts = (entity: Entity): OtherContacts => {
      let entityContacts: OtherContacts;
      if (!contacts.has(entity)) {
        entityContacts = new Map();
        contacts.set(entity, entityContacts);
      } else {
        entityContacts = contacts.get(entityContacts);
      }
      return entityContacts;
    };

    // See https://rapier.rs/docs/user_guides/javascript/physics_event_handling/
    eventQueue.drainContactEvents(
      (handle1: number, handle2: number, contactStarted: boolean) => {
        if (!contactStarted) return;

        const entity1 = this.physics.handleToEntity.get(handle1);
        const entity2 = this.physics.handleToEntity.get(handle2);

        // Only `Impactable` entities participate
        if (entity1 && entity2) {
          const magnitude = this.linearVelocityMagnitude(entity1, entity2);

          const e1contacts: OtherContacts = getOtherContacts(entity1);
          const e2contacts: OtherContacts = getOtherContacts(entity2);

          e1contacts.set(entity2, magnitude);
          e2contacts.set(entity1, magnitude);
        }
      }
    );

    return contacts;
  }

  linearVelocityMagnitude(entity1, entity2) {
    const body1 = entity1.get(RigidBodyRef);
    const body2 = entity2.get(RigidBodyRef);

    const linvel1 = body1.value.linvel();
    const linvel2 = body2.value.linvel();
    const x = linvel1.x - linvel2.x,
      y = linvel1.y - linvel2.y,
      z = linvel1.z - linvel2.z;

    return Math.sqrt(x * x + y * y + z * z);
  }
}

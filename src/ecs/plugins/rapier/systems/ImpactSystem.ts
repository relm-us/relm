import { System, Groups, Not } from "hecs";
import {
  ColliderRef,
  ColliderMapped,
  Impact,
  RigidBodyRef,
} from "../components";

type Entity = any;

function linearVelocityMagnitude(entity1, entity2) {
  const body1 = entity1.get(RigidBodyRef);
  const body2 = entity2.get(RigidBodyRef);

  const linvel1 = body1.value.linvel();
  const linvel2 = body2.value.linvel();
  const x = linvel1.x - linvel2.x,
    y = linvel1.y - linvel2.y,
    z = linvel1.z - linvel2.z;

  return Math.sqrt(x * x + y * y + z * z);
}

export class ImpactSystem extends System {
  order = Groups.Simulation;

  handleToEntityId: Record<number, string> = {};
  entityIdToHandle: Record<string, number> = {};

  static queries = {
    impacts: [Impact],
    added: [ColliderRef, Not(ColliderMapped)],
    removed: [Not(ColliderRef), ColliderMapped],
  };

  update() {
    // We need to manually map Rapier physics collider's handles to
    // HECS entities' IDs
    this.queries.added.forEach((entity) => {
      const ref = entity.get(ColliderRef);
      this.handleToEntityId[ref.value.handle] = entity.id;
      this.entityIdToHandle[entity.id] = ref.value.handle;
    });

    // Don't keep manual map around for entities that no longer have
    // ColliderRef on them
    this.queries.removed.forEach((entity) => {
      const handle = this.entityIdToHandle[entity.id];
      delete this.entityIdToHandle[entity.id];
      delete this.handleToEntityId[handle];
    });

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

  getContacts() {
    const { eventQueue } = this.world.physics;

    const contacts: Map<Entity, Record<string, number>> = new Map();

    // See https://rapier.rs/docs/user_guides/javascript/physics_event_handling/
    eventQueue.drainContactEvents(
      (handle1: number, handle2: number, contactStarted: boolean) => {
        if (!contactStarted) return;

        const entityId1 = this.handleToEntityId[handle1];
        const entityId2 = this.handleToEntityId[handle2];

        const entity1 = this.world.entities.getById(entityId1);
        const entity2 = this.world.entities.getById(entityId2);

        const magnitude = linearVelocityMagnitude(entity1, entity2);

        if (!contacts.has(entity1)) {
          contacts.set(entity1, {});
        }

        if (!contacts.has(entity2)) {
          contacts.set(entity2, {});
        }

        if (entity1 && entity2) {
          contacts.get(entity1)[entityId2] = magnitude;
          contacts.get(entity2)[entityId1] = magnitude;
        }
      }
    );

    return contacts;
  }
}

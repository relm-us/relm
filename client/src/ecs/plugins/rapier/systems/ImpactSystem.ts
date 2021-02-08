import { System, Groups, Not } from "hecs";
import {
  ColliderRef,
  ColliderMapped,
  Impact,
  Impactable,
  RigidBodyRef,
} from "../components";

type Entity = any;
type Magnitude = number;
type OtherContacts = Map<Entity, Magnitude>;

export class ImpactSystem extends System {
  order = Groups.Simulation;

  handleToEntity: Map<number, Entity> = new Map();

  static queries = {
    impacts: [Impact],
    added: [Impactable, ColliderRef, Not(ColliderMapped)],
    removed: [Impactable, Not(ColliderRef), ColliderMapped],
  };

  update() {
    // We need to manually map Rapier physics collider's handles to
    // HECS entities' IDs
    this.queries.added.forEach((entity) => {
      const ref = entity.get(ColliderRef);
      this.handleToEntity.set(ref.value.handle, entity);
      entity.add(ColliderMapped, { handle: ref.value.handle });
    });

    // Don't keep manual map around for entities that no longer have
    // ColliderRef on them
    this.queries.removed.forEach((entity) => {
      const map = entity.get(ColliderMapped);
      this.handleToEntity.delete(map.handle);
      entity.remove(ColliderMapped);
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

  getContacts(): Map<Entity, OtherContacts> {
    const { eventQueue } = this.world.physics;

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

        const entity1 = this.handleToEntity.get(handle1);
        const entity2 = this.handleToEntity.get(handle2);

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

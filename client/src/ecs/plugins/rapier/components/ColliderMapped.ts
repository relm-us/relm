import { LocalComponent } from "hecs";

// Store the fact that the entity with this collider has been mapped in
// the ImpactSystem's handleToEntityId & entityIdToHandle maps
export class ColliderMapped extends LocalComponent {}

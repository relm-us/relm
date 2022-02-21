import { System, Groups, Not, Modified } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Vector3 } from "three";
import {
  BallJoint,
  BallJointRef,
  BallJointBroke,
  RigidBodyRef,
} from "../components";

export class JointSystem extends System {
  order = Groups.Initialization;

  static queries = {
    new: [RigidBodyRef, BallJoint, Not(BallJointRef)],
    removedBody: [Not(RigidBodyRef), BallJointRef],
    removed: [Not(BallJoint), BallJointRef],
    modified: [Modified(BallJoint), BallJointRef],
    broken: [BallJointBroke],
  };

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.removedBody.forEach((entity) => {
      this.release(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.release(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.build(entity);
    });
    this.queries.broken.forEach((entity) => {
      const joint = entity.get(BallJointRef).value;
      // joint.release();
      entity.remove(BallJoint);
      entity.remove(BallJointRef);
      entity.remove(BallJointBroke);
    });
  }

  release(entity) {
    const joint = entity.get(BallJointRef).value;
    // joint.release();
    entity.remove(BallJointRef);
  }

  build(entity) {
    const { world, rapier } = (this.world as any).physics;
    const spec = entity.get(BallJoint);

    const entityBody = entity.get(RigidBodyRef).value;
    // const entityWorld = entity.get(WorldTransform);

    if (spec.entity) {
      const targetEntity = this.world.entities.getById(spec.entity);
      if (!targetEntity) {
        return console.log(
          `JointSystem: ${entity.name} targets unknown entity`
        );
      }
      const targetBody = targetEntity.get(RigidBodyRef)?.value;
      if (!targetBody) {
        return console.log(
          `JointSystem: ${entity.name} targets ${targetEntity.name} but it has no RigidBodyRef`
        );
      }

      const parentPosition = targetEntity.get(Transform).position;
      const childPosition = entity.get(Transform).position;
      // let jointParams = new rapier.JointParams.revolute(
      //   new Vector3(childPosition.x < 0 ? -0.5 : 0.5, 0.5, 0),
      //   new Vector3(0, 0, 1),
      //   childPosition,
      //   new Vector3(0, 0, 1),
      // );
      const position: Vector3 = new Vector3()
        .copy(childPosition)
        .sub(parentPosition);
      let jointParams = new rapier.JointParams.ball(spec.position, position);

      const joint = world.createJoint(jointParams, targetBody, entityBody);

      const existing = entity.get(BallJointRef);
      if (existing) {
        existing.joint.release();
        existing.joint = joint;
        existing.modified();
      } else {
        entity.add(BallJointRef, { value: joint });
      }
    } else {
      throw new Error("joint must specify entity");
    }
  }
}

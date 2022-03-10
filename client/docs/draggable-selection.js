var entities = [...relm.selection.entities];

entities.forEach(entity => {
  const draggable = entity.getByName("Draggable");
  if (draggable) {
    draggable.grid = true;
    draggable.gridSize = 0.318 / 2;
    draggable.gridOffset = new THREE.Vector2(0.0, 0.14);

    const transform = entity.getByName("Transform");
    transform.position.z = -19.5;
    transform.modified();

    relm.worldDoc.syncFrom(entity);
  }
});

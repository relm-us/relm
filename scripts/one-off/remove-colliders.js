// One-off script to help remove lots of Collider components

var ens = [];
relm.world.entities.entities.forEach((e) => {
  var t = e.getByName("Transform");
  if (t && t.position.y === 0.11499779939651489) {
    ens.push(e);
  }
});

var Collider = ens[0].getByName("Collider").constructor;

for (const e of ens) {
  console.log(e.id);
  e.remove(Collider);
  relm.wdoc.syncFrom(e);
}

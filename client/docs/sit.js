var model = relm.participants.local.avatar.entities.body.getByName("Model2");
var con =
  relm.participants.local.avatar.entities.body.getByName("ControllerState");
con.animOverride = { clipName: "stand-to-sit-chair", loop: false };
model.offset.set(0, 0, 1.8);
model.modified();

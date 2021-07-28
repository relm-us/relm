
var participant = relm.identities.me.avatar.entity;
var rocket = relm.world.entities.getById('b8eSmt2MZh5jnyalNyJVP');
var poolTable = relm.world.entities.getById('16F36onDO00YQfi18zmL7');
var pizza = relm.world.entities.getById('hk3973USWQP8zq1LTFCHU');

var delay = (ms) => new Promise((done) => setTimeout(done, ms));

var action = async () => {
  relm.start();
  
  relm.camera.circleAround(participant, { radians: Math.PI/2, radius: 10, height: 6, radianStep: 0});
  await delay(1500);
  relm.camera.circleAround(rocket, { height: 2, radianStep: 0 });
  await delay(500);
  relm.camera.circleAround(rocket, { height: 2, radianStep: 0.01 });
  await delay(2500);
  relm.camera.circleAround(poolTable, { radius: 10, height: 10, radianStep: 0 });
  await delay(500);
  relm.camera.circleAround(poolTable, { radius: 10, height: 10, radianStep: 0.01 });
  await delay(2500);
  relm.camera.circleAround(pizza, { radius: 3, height: 5, radianStep: 0.01 });
  await delay(4000);
  relm.camera.followParticipant();
}

action();
const ServerAVAdapter = require("../base/ServerAVAdapter").ServerAVAdapter;

export class MediasoupServerAVAdapter extends ServerAVAdapter {
  getToken(identity) {
    return this.hasPermission(identity) ? "ok" : "";
  }
}

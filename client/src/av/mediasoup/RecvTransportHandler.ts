import type { Transport } from "mediasoup-client/lib/Transport";
import type { Peer } from "protoo-client";

export function listen(recvTransport: Transport, peer: Peer) {
  recvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
    peer
      .request("connectWebRtcTransport", {
        transportId: recvTransport.id,
        dtlsParameters,
      })
      .then(callback)
      .catch(errback);
  });
}

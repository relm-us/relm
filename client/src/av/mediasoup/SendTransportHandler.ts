import type { Transport } from "mediasoup-client/lib/Transport";
import type { Peer } from "protoo-client";

export function listen(sendTransport: Transport, peer: Peer) {
  sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
    peer
      .request("connectWebRtcTransport", {
        transportId: sendTransport.id,
        dtlsParameters,
      })
      .then(callback)
      .catch(errback);
  });

  sendTransport.on(
    "produce",
    async ({ kind, rtpParameters, appData }, callback, errback) => {
      try {
        const { id } = await peer.request("produce", {
          transportId: sendTransport.id,
          kind,
          rtpParameters,
          appData,
        });
        callback({ id });
      } catch (error) {
        errback(error);
      }
    }
  );
}

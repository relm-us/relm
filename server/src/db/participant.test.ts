import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import { CryptoKey } from "@peculiar/webcrypto";

import * as Participant from "./participant.js";
import * as crypto from "../crypto.js";

import { uuidv4 } from "../utils/index.js";
import { init, deinit } from "./db.js";

describe("Participant model tests", () => {
  beforeAll(init);
  afterAll(deinit);

  it("sets and gets public key document", async () => {
    const participantId = uuidv4();
    const pubKeyDoc = [uuidv4()];
    expect(await Participant.hasPubKeyDoc({ participantId })).toBe(false);
    await Participant.addPubKeyDoc({ participantId, pubKeyDoc });
    expect(await Participant.hasPubKeyDoc({ participantId })).toBe(true);
    expect(Participant.addPubKeyDoc({ participantId, pubKeyDoc })).rejects.toThrow(
      "duplicate key"
    );
    expect(await Participant.getPubKeyDoc({ participantId })).toEqual(pubKeyDoc);
  });

  it("finds or creates verified pubKey", async () => {
    const participantId = "0dce4601-0a92-4c52-ad4a-f355ede669c6";
    const x =
      "P0HWf4l6bGz6ULfaPROfQSsg_pWfK3ICgsH2UDs-Bb45Q_Qj9QVnhryBpwzjp6Xi";
    const y =
      "Ggf-tcvJE0CqzcslV2VT2pL2NUHtpQyZakTijZbf4HjVRv6VW_5_VanKQS3TVUZx";
    const sig =
      "q8msamtVrQf4JVQjid7KG6EG93KkndjC0VMAo2JVUR4KAGtnncxuUY3BV2Hu7Jmk3Y9gLT/VfG24yhkhxH6KKsBsMO6FjWAdxRd0P3q+E1VZd4e4KgzB/N82jjPKDq5O";
    const pubKey = await Participant.findOrCreateVerifiedPubKey({
      participantId,
      x,
      y,
      sig,
    });
    expect(pubKey instanceof CryptoKey).toBe(true);

    const participantId2 = "51d969cd-b7e7-4190-8ee8-353a92bf8823";
    const x2 =
      "jTyjqvWMYYz_yQKGxvuGkaf5ielpjmStj3NYHCit8JKjQxP-ivuyzhGXiW0nCAhB";
    const y2 =
      "3RCyHuYhaEBqdxB4-g6Gm8qZ_TePf5a5lcTJvsf0D9GdFgyJ5vT_T0iWHgYh-3-e";
    const sig2 =
      "atZqkkF5m2GeQ9EN9h2R2sJ9mhLiWkasZjFUMfbtXJomYws1mDQwZUkKhbJcJFuCCPsi/RXb8DbcTt8kVXDXn8DAiI5k+RuHtz9dnsKrPV12gitExLQw/U2PebRaPh+F";

    // We pass in the original participantId and sig here, because we want it to verify based on what's in the DB, not the xy params we pass in
    const foundPubKey = await Participant.findOrCreateVerifiedPubKey({
      participantId,
      x: x2,
      y: y2,
      sig,
    });

    expect(await crypto.verify(participantId, sig, foundPubKey)).toBe(true);
  });
});

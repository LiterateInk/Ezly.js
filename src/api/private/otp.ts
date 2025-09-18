import type { Identification } from "~/models";
import { utf8ToBytes } from "@noble/hashes/utils";
import { base64, base64url } from "@scure/base";
import { hashWithHMAC } from "~/core/hmac";
import { packBigEndian } from "~/core/pack";

export const otp = (identification: Identification): string => {
  const packedCounter = packBigEndian(identification.counter);
  const hotp = base64url.encode(hashWithHMAC(utf8ToBytes(packedCounter), base64.decode(identification.seed)));

  // Increment the counter !
  // That's why the `identification` object
  // should be saved (by the user) after calling this function.
  identification.counter++;

  return hotp;
};

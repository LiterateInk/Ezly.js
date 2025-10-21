import { hmac } from "@noble/hashes/hmac.js";
import { sha1 } from "@noble/hashes/legacy.js";

export const hashWithHMAC = (content: Uint8Array, key: Uint8Array): Uint8Array => {
  return hmac.create(sha1, key)
    .update(content)
    .digest();
};

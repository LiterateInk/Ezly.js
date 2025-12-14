import type { Identification } from "~/models";
import { p256 } from "@noble/curves/nist.js";

import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { ECPrivateKey } from "@peculiar/asn1-ecc";
import { PrivateKeyInfo } from "@peculiar/asn1-pkcs8";

import { AsnParser } from "@peculiar/asn1-schema";
import { base64 } from "@scure/base";

import { otp } from "~/api/private/otp";
import { hashWithHMAC } from "~/core/hmac";

// NOTE: We're only using `IZLY` for now but
// in the app there's also `SMONEY` as a mode.
const QrCodeMode = {
  IZLY: "AIZ",
  SMONEY: "A"
} as const;

/**
 * Generates the signature for the last
 * part of the QR code payload.
 */
const sign = (content: Uint8Array, keyInfo: string): Uint8Array => {
  const info = AsnParser.parse(base64.decode(keyInfo), PrivateKeyInfo);
  const keys = AsnParser.parse(info.privateKey.buffer, ECPrivateKey);
  const privateKey = new Uint8Array(keys.privateKey.buffer);

  const signed = p256.sign(content, privateKey, { format: "der" });

  // Here's how we can debug this function...
  // Prerequisites: have the same inputs as the app when generating the QR code,
  //                so make sure to have the same `identification` object
  //                and `date` string as the payload.
  //
  // 1. Retrieve the public key from the private key
  // -  Luckily, Izly provides the public key in the ECPrivateKey structure.
  // const publicKey = p256.getPublicKey(privateKey);
  //
  // 2. Grab the last part of the QR code payload
  // -  so the part we're generating in this function...
  // const signedFromKotlin = base64.decode("MEQCIDQDJaRdEkAmtoucOSiKVNazGfUOHHlsmOq8ZQWdXrbWAiA2nYsGAqKpFYlINKaT3YTUsnZfKhJslzh8yrZ/5QvzOg==");
  //
  // 3. Compare the app's generated signature with the hash we generated !
  // const verified = p256.verify(signedFromKotlin, content, publicKey, { format: "der" });
  // console.log("verified:", verified);
  //
  // When `verified` is true, the signature is valid.
  // Othrwise, the signature is invalid and there's work to do...

  return signed;
};

/**
 * Generates the payload that are contained
 * in the QR codes for the payment in the app.
 */
export const qrPay = (identification: Identification): string => {
  // Replicate `SimpleDateFormat("yyyy-MM-dd HH:mm:ss")`
  const dateFormatter = new Intl.DateTimeFormat("en-CA", { day: "2-digit", hour: "2-digit", hour12: false, minute: "2-digit", month: "2-digit", second: "2-digit", timeZone: "UTC", year: "numeric" });
  const date = dateFormatter.format(new Date()).replace(",", "");
  const hotpCode = otp(identification);

  const content = `${QrCodeMode.IZLY};${identification.userPublicID};${date};3`;
  const hmac = bytesToHex(hashWithHMAC(utf8ToBytes(`${content}+${identification.nsse}`), utf8ToBytes(hotpCode)));
  const payload = `${content};${hmac};`;

  // Concatenate payload with signature.
  return payload + base64.encode(sign(utf8ToBytes(payload), identification.qrCodePrivateKey));
};

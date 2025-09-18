import type { Request } from "@literate.ink/utilities";
import type { Configuration, Identification, Profile } from "~/models";
import { defaultFetcher, type Fetcher, findValueBetween, getHeaderFromResponse } from "@literate.ink/utilities";

import { XMLParser } from "fast-xml-parser";
import { CLIENT_TYPE, SERVICE_VERSION, SOAP_URL, SOAP_USER_AGENT } from "~/core/constants";

import { xml } from "~/core/xml";
import { decodeBalance } from "~/decoders/balance";
// import { setDeviceToken } from "./private/set-device-token";

export const extractActivationURL = async (url: string, fetcher: Fetcher = defaultFetcher): Promise<string> => {
  const response = await fetcher({ redirect: "manual", url: new URL(url) });
  const location = getHeaderFromResponse(response, "Location");

  if (!location) {
    throw new Error("URL to tokenize expired");
  }

  return location;
};

// eslint-disable-next-line ts/explicit-function-return-type
export const tokenize = async (url: string, fetcher: Fetcher = defaultFetcher) => {
  // encoded like this:
  // izly://SBSCR/<identifier>/<code>
  const parts = url.split("/");
  const code = parts.pop()!;
  const identifier = parts.pop()!;

  const body = xml.header + xml.envelope(`
    <Logon xmlns="Service" id="o0" c:root="1">
    ${xml.property("version", SERVICE_VERSION)}
    ${xml.property("channel", "AIZ")}
    ${xml.property("format", "T")}
    ${xml.property("model", "A")}
    ${xml.property("language", "fr")}
    ${xml.property("user", identifier)}
    <password i:null="true" />
    ${xml.property("smoneyClientType", CLIENT_TYPE)}
    ${xml.property("rooted", "0")}
    ${xml.property("actCode", code)}
    </Logon>
  `);

  const request: Request = {
    content: body,
    headers: {
      "clientVersion": SERVICE_VERSION,
      "Content-Type": "text/xml;charset=utf-8",
      "smoneyClientType": CLIENT_TYPE,
      "SOAPAction": "Service/Logon",
      "User-Agent": SOAP_USER_AGENT
    },
    method: "POST",
    url: SOAP_URL
  };

  const response = await fetcher(request);

  const result = findValueBetween(response.content, "<LogonResult>", "</LogonResult>");
  if (!result) throw new Error("No <LogonResult> found in response");

  const decoded = xml.from_entities(result);
  const parser = new XMLParser({
    numberParseOptions: {
      hex: true,
      leadingZeros: true,
      skipLike: /[0-9]/
    }
  });
  const { Logon } = parser.parse(decoded);

  const output = {
    balance: decodeBalance(Logon.UP),

    configuration: {
      currency: Logon.CUR,
      moneyInMaximum: parseFloat(Logon.MONEYINMAX),
      moneyInMinimum: parseFloat(Logon.MONEYINMIN),
      moneyOutMaximum: parseFloat(Logon.MONEYOUTMAX),
      moneyOutMinimum: parseFloat(Logon.MONEYOUTMIN),

      paymentMaximum: parseFloat(Logon.P2PPAYMAX),
      paymentMinimum: parseFloat(Logon.P2PPAYMIN),
      paymentPartMaximum: parseFloat(Logon.P2PPAYPARTMAX),
      paymentPartMinimum: parseFloat(Logon.P2PPAYPARTMIN)
    } as Configuration,

    identification: {
      accessToken: Logon.OAUTH.ACCESS_TOKEN,

      accessTokenExpiresIn: parseInt(Logon.OAUTH.EXPIRES_IN),
      counter: 0,
      identifier: Logon.UID,
      nsse: Logon.NSSE,

      qrCodePrivateKey: Logon.QR_CODE_PRIVATE_KEY,

      refreshToken: Logon.OAUTH.REFRESH_TOKEN,
      seed: Logon.SEED,

      sessionID: Logon.SID,
      token: Logon.TOKEN,
      userID: Logon.USER_ID,

      userPublicID: Logon.USER_PUBLIC_ID
    } as Identification,

    profile: {
      email: Logon.EMAIL,
      firstName: Logon.FNAME,
      identifier: Logon.ALIAS,
      lastName: Logon.LNAME
    } as Profile
  };

  // register the token for this session id
  // EDIT: apparently only for GCM (Google Cloud Messaging)
  // await setDeviceToken(output.identification, fetcher);

  return output;
};

import { defaultFetcher, type Fetcher, findValueBetween, type Request } from "@literate.ink/utilities";
import { XMLParser } from "fast-xml-parser";

import { CLIENT_TYPE, SERVICE_VERSION, SOAP_URL, SOAP_USER_AGENT } from "~/core/constants";
import { xml } from "~/core/xml";

// eslint-disable-next-line ts/explicit-function-return-type
export const login = async (identifier: string, secret: string, fetcher: Fetcher = defaultFetcher) => {
  const body = xml.header + xml.envelope(`
    <Logon xmlns="Service" id="o0" c:root="1">
    ${xml.property("version", SERVICE_VERSION)}
    ${xml.property("channel", "AIZ")}
    ${xml.property("format", "T")}
    ${xml.property("model", "A")}
    ${xml.property("language", "fr")}
    ${xml.property("user", identifier)}
    ${xml.property("password", secret)}
    ${xml.property("smoneyClientType", CLIENT_TYPE)}
    ${xml.property("rooted", "0")}
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
  if (response.status !== 200) { // can be 500 apparently
    throw new Error(`${response.status}: ${response.content}`);
  }

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
  const parsed = parser.parse(decoded);

  if ("E" in parsed && "Error" in parsed.E) {
    throw new Error(`${parsed.E.Msg} (${parsed.E.Code})`);
  }

  return {
    salt: parsed.UserData.SALT as string,
    uid: parsed.UserData.UID as string
  };
};

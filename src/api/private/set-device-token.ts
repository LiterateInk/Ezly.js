import type { Identification } from "~/models";
import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, SERVICE_VERSION, SOAP_URL, SOAP_USER_AGENT } from "~/core/constants";
import { xml } from "~/core/xml";

export const setDeviceToken = async (identification: Identification, fetcher: Fetcher = defaultFetcher): Promise<void> => {
  const body = xml.header + xml.envelope(`
    <SetDeviceToken xmlns="Service" id="o0" c:root="1">
    ${xml.property("version", SERVICE_VERSION)}
    ${xml.property("channel", "AIZ")}
    ${xml.property("format", "T")}
    ${xml.property("model", "A")}
    ${xml.property("language", "fr")}
    ${xml.property("sessionId", identification.sessionID)}
    ${xml.property("userId", identification.identifier)}
    ${xml.property("tokentype", "GCM")}
    ${xml.property("token", identification.token)}
    </SetDeviceToken>
  `);

  const request: Request = {
    content: body,
    headers: {
      "Authorization": `Bearer ${identification.accessToken}`,
      "clientVersion": SERVICE_VERSION,
      "Content-Type": "text/xml;charset=utf-8",
      "smoneyClientType": CLIENT_TYPE,
      "SOAPAction": "Service/SetDeviceToken",
      "User-Agent": SOAP_USER_AGENT
    },
    method: "POST",
    url: SOAP_URL
  };

  await fetcher(request);
};

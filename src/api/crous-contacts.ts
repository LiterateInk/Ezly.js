import type { Error as ServerError } from "~/definitions/error";
import type { IzlyCrous } from "~/definitions/izly-crous";
import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";

import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { type Identification, ReauthenticateError } from "~/models";
export type { IzlyCrous };

// eslint-disable-next-line ts/explicit-function-return-type
export const crousContacts = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    headers: {
      Authorization: `Bearer ${identification.accessToken}`,
      channel: "AIZ",
      clientVersion: SERVICE_VERSION,
      format: "T",
      language: "fr",
      model: "A",
      sessionId: identification.sessionID,
      smoneyClientType: CLIENT_TYPE,
      userId: identification.identifier,
      version: "2.0"
    },
    url: createRouteREST("GetCrousContactList")
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as ServerError | {
    GetCrousContactListResult: {
      Result: {
        CrousList: Array<IzlyCrous>;
        UserContact: {
          Email: string;
          Name: string;
          Phone: string;
        };
      };
    };
  };

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return json.GetCrousContactListResult;
};

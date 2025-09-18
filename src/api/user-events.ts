import type { Error as ServerError } from "~/definitions/error";
import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { type Identification, ReauthenticateError } from "~/models";

// eslint-disable-next-line ts/explicit-function-return-type
export const userEvents = async (identification: Identification, itemPerPage = 10, page = 0, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    content: JSON.stringify({
      itemPerPage,
      page
    }),
    headers: {
      "Authorization": `Bearer ${identification.accessToken}`,
      "channel": "AIZ",
      "clientVersion": SERVICE_VERSION,
      "Content-Type": "application/json",
      "format": "T",
      "language": "fr",
      "model": "A",
      "sessionId": identification.sessionID,
      "smoneyClientType": CLIENT_TYPE,
      "userId": identification.identifier,
      "version": "2.0"
    },
    method: "POST",
    url: createRouteREST("GetUserEventList")
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as {
    GetUserEventListResult: Array<{
      /**
       * formatted as `le D/M/YYYY à H:mm AM/PM`
       */
      EventFormattedDate: string;
      EventMessage: string;
    }>;
  } | ServerError;

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return json.GetUserEventListResult;
};

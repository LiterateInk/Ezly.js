import type { Error as ServerError } from "~/definitions/error";
import type { UP } from "~/definitions/up";
import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { decodeBalance } from "~/decoders/balance";
import { type Balance, type Identification, ReauthenticateError } from "~/models";

export const balance = async (identification: Identification, fetcher: Fetcher = defaultFetcher): Promise<Balance> => {
  const request: Request = {
    content: JSON.stringify({
      sessionId: identification.sessionID
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
      "version": "1.0"
    },
    method: "POST",
    url: createRouteREST("IsSessionValid")
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as ServerError | {
    IsSessionValidResult: {
      UP: UP;
    };
  };

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return decodeBalance(json.IsSessionValidResult.UP);
};

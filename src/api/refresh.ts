import type { ClientUserStatus } from "~/definitions/client-user-status";
import type { Error as ServerError } from "~/definitions/error";
import type { Tokens } from "~/definitions/tokens";
import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";

import { type Identification, NotRefreshableError, ReauthenticateError } from "~/models";
import { otp } from "./private/otp";
export type { ClientUserStatus, Tokens };

export const refresh = async (identification: Identification, secret: string, fetcher: Fetcher = defaultFetcher): Promise<void> => {
  const passOTP = secret + otp(identification);

  const request: Request = {
    headers: {
      "Authorization": `Bearer ${identification.accessToken}`,
      "channel": "AIZ",
      "clientVersion": SERVICE_VERSION,
      "Content-Type": "application/x-www-form-urlencoded",
      "format": "T",
      "language": "fr",
      "model": "A",
      passOTP,
      "password": secret,
      "smoneyClientType": CLIENT_TYPE,
      "userId": identification.identifier,
      "version": "2.0"
    },
    method: "POST",
    url: createRouteREST("LogonLight")
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as ServerError | {
    LogonLightResult: {
      Result: {
        HasNewActu: boolean;
        NSSE: null | string;
        SessionId: string;
        Tokens: null | Tokens;
        UserStatus: ClientUserStatus;
      };
    };
  };

  if ("Code" in json) {
    if (json.Code === 571)
      // For some reason, people might receive an SMS
      // at this moment, but the URL in the SMS
      // is completely unusable...
      throw new NotRefreshableError();

    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  const result = json.LogonLightResult.Result;
  identification.sessionID = result.SessionId;

  if (result.NSSE) {
    identification.nsse = result.NSSE;
  }

  if (result.Tokens) {
    identification.accessToken = result.Tokens.AccessToken;
    identification.refreshToken = result.Tokens.RefreshToken;
    identification.accessTokenExpiresIn = result.Tokens.ExpiresIn;
  }
};

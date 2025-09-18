import type { Fetcher, Request } from "@literate.ink/utilities";
import type { Error as ServerError } from "~/definitions/error";
import type { UP } from "~/definitions/up";
import type { Identification } from "~/models";
import { defaultFetcher } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { decodeFormattedDate } from "~/decoders/date";
import { ReauthenticateError } from "~/models";

// eslint-disable-next-line ts/explicit-function-return-type
export const contact = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    content: JSON.stringify({
      receiver: {
        Identifier: identification.identifier
      }
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
    url: createRouteREST("GetContactDetails")
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as ServerError | {
    GetContactDetailsResult: {
      Result: {
        Actions: null;
        ActiveAlias: string;
        ActivePhone: {
          PhoneDisplayInternationalNumber: string;
          PhoneDisplayNumber: string;
          PhoneInternationalNumber: string;
        };
        CanDisplayPhoto: boolean;
        Children: Array<{
          DisplayName: null;
          Identifier: null;
          IsSmoneyPro: boolean;
          IsSmoneyUser: boolean;
        }>;
        DisplayName: string;
        HasPhoto: boolean;
        Identifier: string;
        IsBlocked: boolean;
        IsBookmarked: boolean;
        IsMe: boolean;
        IsSmoneyPro: boolean;
        IsSmoneyUser: boolean;
        IzlyProfile: {
          CardNumber: string;
          CodeSociete: number;
          DateValidity: Date;
          IzlyEmail: string;
          NumeroTarif: number;
        };
        Operations: null;
        OptIn: boolean;
        OptInPartners: boolean;
        PreAuthorization: null;
        Profile: {
          Address: {
            City: string;
            Country: number;
            Name: string;
            ZipCode: string;
          };
          BirthDate: Date;
          Civility: number;
          Email: string;
          FirstName: string;
          LastName: string;
        };
        ProInfos: null;
        SecondDisplayName: string;
      };
      UP: UP;
    };
  };

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  const izprofile = json.GetContactDetailsResult.Result.IzlyProfile;
  // @ts-expect-error : JSON is string (we provided Date)
  izprofile.DateValidity = decodeFormattedDate(izprofile.DateValidity);

  const profile = json.GetContactDetailsResult.Result.Profile;
  // @ts-expect-error : JSON is string (we provided Date)
  profile.BirthDate = decodeFormattedDate(profile.BirthDate);

  return json.GetContactDetailsResult;
};

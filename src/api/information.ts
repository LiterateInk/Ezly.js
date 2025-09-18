import type { BankCode } from "~/definitions/bank-code";

import type { ClientUserRole } from "~/definitions/client-user-role";
import type { ClientUserStatus } from "~/definitions/client-user-status";
import type { Error as ServerError } from "~/definitions/error";

import type { LimitMoneyIn } from "~/definitions/limit-money-in";
import type { UP } from "~/definitions/up";
import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { decodeBalance } from "~/decoders/balance";
import { type Configuration, type Identification, type Profile, ReauthenticateError } from "~/models";

// eslint-disable-next-line ts/explicit-function-return-type
export const information = async (identification: Identification, fetcher: Fetcher = defaultFetcher) => {
  const request: Request = {
    headers: {
      Authorization: `Bearer ${identification.accessToken}`,
      channel: "AIZ",
      clientVersion: SERVICE_VERSION,
      format: "T",
      language: "fr",
      model: "A",
      smoneyClientType: CLIENT_TYPE,
      userId: identification.identifier,
      version: "2.0"
    },
    url: createRouteREST("GetLogonInfos")
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as ServerError | {
    GetLogonInfosResult: {
      Result: {
        Age: number;
        Alias: string;
        Banks: Array<BankCode>;
        CategoryUserId: number;
        Crous: string;
        CrousName: string;
        Currency: string;
        Email: string;
        FirstName: string;
        HasNewActu: boolean;
        LastName: string;
        LimitMoneyIn: LimitMoneyIn;
        LimitMoneyOut: LimitMoneyIn;
        LimitPayment: LimitMoneyIn;
        LimitPaymentPart: LimitMoneyIn;
        OptIn: boolean;
        OptInPartners: boolean;
        Role: ClientUserRole;
        Services: string[]; // NOTE: "Izly" is the only value I've seen
        ServicesInfos: null | unknown; // TODO
        SubscriptionDate: string;
        TarifUserId: number;
        TermsConditionsAgreementDate: string;
        Token: string;
        UserId: number;
        UserIdentifier: string;
        UserStatus: ClientUserStatus;
        ZipCode: string;
      };

      UP: UP;
    };
  };

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  const data = json.GetLogonInfosResult.Result;

  return {
    balance: decodeBalance(json.GetLogonInfosResult.UP),

    configuration: {
      currency: data.Currency,
      moneyInMaximum: data.LimitMoneyIn.Max,
      moneyInMinimum: data.LimitMoneyIn.Min,
      moneyOutMaximum: data.LimitMoneyOut.Max,
      moneyOutMinimum: data.LimitMoneyOut.Min,
      paymentMaximum: data.LimitPayment.Max,
      paymentMinimum: data.LimitPayment.Min,
      paymentPartMaximum: data.LimitPaymentPart.Max,
      paymentPartMinimum: data.LimitPaymentPart.Min
    } as Configuration,

    profile: {
      email: data.Email,
      firstName: data.FirstName,
      identifier: data.UserIdentifier,
      lastName: data.LastName
    } as Profile
  };
};

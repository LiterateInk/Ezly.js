import type { Error as ServerError } from "~/definitions/error";
import type { HomePageOperation } from "~/definitions/home-page-operation";
import { defaultFetcher, type Fetcher, type Request } from "@literate.ink/utilities";
import { CLIENT_TYPE, createRouteREST, SERVICE_VERSION } from "~/core/constants";
import { decodeFormattedDate } from "~/decoders/date";
import { TransactionGroup } from "~/definitions/transaction-group";

import { type Identification, type Operation, ReauthenticateError } from "~/models";
export { TransactionGroup };

/**
 * @returns a list of the last operations
 */
export const operations = async (identification: Identification, group: TransactionGroup, limit = 15, fetcher: Fetcher = defaultFetcher): Promise<Array<Operation>> => {
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
    url: createRouteREST(`GetHomePageOperations?transactionGroup=${group}&top=${limit}`)
  };

  const response = await fetcher(request);
  const json = JSON.parse(response.content) as ServerError | {
    GetHomePageOperationsResult: {
      Result: Array<HomePageOperation>;
    };
  };

  if ("ErrorMessage" in json) {
    if (json.Code === 140 || json.Code === 570)
      throw new ReauthenticateError();

    throw new Error(`${json.ErrorMessage} (${json.Code})`);
  }

  return json.GetHomePageOperationsResult.Result.map((operation) => ({
    amount: operation.Amount,
    date: decodeFormattedDate(operation.Date),
    id: operation.Id,
    isCredit: operation.IsCredit,
    message: operation.Message,
    status: operation.Status,
    type: operation.OperationType
  } satisfies Operation));
};

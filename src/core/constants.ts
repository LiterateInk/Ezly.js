export const SERVICE_VERSION = "7.0";
export const CLIENT_TYPE = "PART";

export const SOAP_URL = new URL("https://soap.izly.fr/Service.asmx");
export const SOAP_USER_AGENT = "ksoap2-android/2.6.0+"; // mimick the kotlin app

// eslint-disable-next-line ts/explicit-function-return-type
export const createRouteREST = (action: string) =>
  new URL(`https://rest.izly.fr/Service/PublicService.svc/rest/${action}`);

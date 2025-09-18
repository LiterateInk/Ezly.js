/**
 * Can only be retrieved during `tokenize()` process,
 * so make sure to save it !
 */
export type Identification = Readonly<{
  /**
   * Identifier of the user, probably the phone number.
   * @from Logon.UID
   */
  identifier: string;

  /**
   * Key used to generate QR code for payment.
   * If you want to generate a QR code, use `izly.qrPay()`.
   * Not relevant to users, should only be used internally.
   * @from Logon.QR_CODE_PRIVATE_KEY
   */
  qrCodePrivateKey: string;

  /**
   * Not relevant to users, should only be used internally.
   * @from Logon.SEED
   */
  seed: string;

  /**
   * Token used for SOAP requests.
   * Not relevant to users, should only be used internally.
   * @from Logon.TOKEN
   */
  token: string;

  /**
   * @from Logon.USER_ID
   */
  userID: string;

  /**
   * Also known as `GUID` in the app internals.
   * Not relevant to users, should only be used internally.
   * @from Logon.USER_PUBLIC_ID
   */
  userPublicID: string;
}> & {
  /**
   * OAuth token used for REST requests.
   * Not relevant to users, should only be used internally.
   * @from Logon.OAUTH.ACCESS_TOKEN
   */
  accessToken: string;

  /**
   * Time when the OAuth token used for REST requests expires.
   * @from Logon.OAUTH.EXPIRES_IN
   */
  accessTokenExpiresIn: number;

  /**
   * Incremented each time `otp()` is called.
   * Not relevant to users, should only be used internally.
   */
  counter: number;

  /**
   * Not relevant to users, should only be used internally.
   * @from Logon.NSSE
   */
  nsse: string;

  /**
   * Not relevant to users, should only be used internally.
   * @from Logon.OAUTH.ACCESS_TOKEN
   */
  refreshToken: string;

  /**
   * ID of the session.
   * Required for most requests and is renewed at when `izly.refresh()` is called.
   * Not relevant to users, should only be used internally.
   * @from Logon.SID
   */
  sessionID: string;
};

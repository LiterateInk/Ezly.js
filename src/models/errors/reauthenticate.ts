export class NotRefreshableError extends Error {
  constructor() {
    super("Another session might've been created, you can't continue with this one since it expired");
    this.name = "NotRefreshableError";
  }
}

export class ReauthenticateError extends Error {
  constructor() {
    super("You have to re-authenticate to perform this action");
    this.name = "ReauthenticateError";
  }
}

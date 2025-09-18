export type Profile = Readonly<{
  email: string;
  firstName: string;
  /** an alias identifier */
  identifier: string;
  lastName: string;
}>;

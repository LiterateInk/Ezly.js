export type Balance = Readonly<{
  cashValue: number;
  g7CardValue: number;
  lastUpdate: Date;

  value: number;
}>;

export type Configuration = Readonly<{
  currency: string;

  moneyInMaximum: number;
  moneyInMinimum: number;
  moneyOutMaximum: number;
  moneyOutMinimum: number;

  paymentMaximum: number;
  paymentMinimum: number;
  paymentPartMaximum: number;
  paymentPartMinimum: number;
}>;

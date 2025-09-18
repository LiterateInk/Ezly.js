import type { UP } from "~/definitions/up";
import type { Balance } from "~/models";

export const decodeBalance = (data: UP): Balance => {
  // ex: 31-08-2024 04:57:45
  const [date, time] = data.LUD.split(" ") as string[];
  // date is reversed for proper parsing, we reverse it manually.
  const reversedDate = date.split("-").reverse().join("-");

  return {
    // @ts-expect-error : sometimes might be a string...
    cashValue: parseFloat(data.CASHBAL),
    // @ts-expect-error : sometimes might be a string...
    g7CardValue: parseFloat(data.G7CARDBAL ?? 0),
    lastUpdate: new Date(`${reversedDate} ${time}`),
    // @ts-expect-error : sometimes might be a string...
    value: parseFloat(data.BAL)
  };
};

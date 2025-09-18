// eslint-disable-next-line ts/explicit-function-return-type
export const decodeFormattedDate = (date: string) => new Date(parseInt(date.substring(6, date.length - 2).split("+")[0]));

import * as izly from "../src";
import { read } from "./_persisted-session";

void (async function main() {
  const identification = await read();

  const payments = await izly.operations(identification, izly.TransactionGroup.Payments, 5);
  const topup = await izly.operations(identification, izly.TransactionGroup.TopUp, 5);

  console.info("--- Payments");
  for (const payment of payments) {
    const priceAsString = `${payment.amount.toPrecision(3)} EUR`;
    console.info("Paid", priceAsString, "the", payment.date.toLocaleString("fr-FR"));
    console.info("=> (type):", izly.OperationType[payment.type], `(${payment.type})`);
    console.info("=> (status):", izly.TransactionGroupStatus[payment.status], `(${payment.status})`);
  }

  console.info("\n--- TopUp");
  for (const operation of topup) {
    const priceAsString = `${operation.amount.toPrecision(3)} EUR`;
    console.info("Received", priceAsString, "the", operation.date.toLocaleString("fr-FR"));
    console.info("=> (type):", izly.OperationType[operation.type], `(${operation.type})`);
    console.info("=> (status):", izly.TransactionGroupStatus[operation.status], `(${operation.status})`);
  }
}());

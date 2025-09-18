import * as izly from "../src";
import { read } from "./_persisted-session";

void (async function main() {
  const identification = await read();

  const balance = await izly.balance(identification);
  // note that information also gives balance but let's not use it here !
  const { configuration } = await izly.information(identification);

  console.log("Your balance is currently at", balance.value, configuration.currency);
  console.log("Your cash balance is currently at", balance.cashValue, configuration.currency);
  console.log(`Last updated the ${balance.lastUpdate.toLocaleString("fr-FR")}`);
}());

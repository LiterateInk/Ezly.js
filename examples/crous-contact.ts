import * as izly from "../src";
import { read } from "./_persisted-session";

void (async function main() {
  const identification = await read();

  const contacts = await izly.crousContacts(identification);
  console.dir(contacts, { depth: Infinity });
}());

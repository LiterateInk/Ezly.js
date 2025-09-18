import * as izly from "../src";
import { read } from "./_persisted-session";

void (async function main() {
  const identification = await read();
  const contact = await izly.contact(identification);

  console.dir(contact, { depth: Infinity });
}());

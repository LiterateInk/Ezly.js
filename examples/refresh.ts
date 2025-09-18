import * as izly from "../src";
import { credentials } from "./_credentials";
import { persist, read } from "./_persisted-session";

void (async function main() {
  const identification = await read();

  await izly.refresh(identification, credentials.secret);
  // identification mutated, we need to resave it.
  await persist(identification);

  console.log("Session refreshed !");
}());

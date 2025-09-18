import * as izly from "../src";
import { read } from "./_persisted-session";

void (async function main() {
  const identification = await read();

  const limits = await izly.limits(identification);
  console.dir(limits, { depth: Infinity });
}());

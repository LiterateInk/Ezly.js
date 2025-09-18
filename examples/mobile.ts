import * as izly from "../src";
import { credentials } from "./_credentials";
import { persist } from "./_persisted-session";

void (async function main() {
  const { uid } = await izly.login(credentials.identifier, credentials.secret);

  // NOTE: `prompt` is only available on Bun
  // TODO: replace with inquirer probably...
  const url = prompt(`Please, enter the URL you want to tokenize for UID '${uid}':`)?.trim();
  if (!url) throw new Error("No URL provided");

  const activationURL = await izly.extractActivationURL(url);
  const { balance, configuration, identification, profile } = await izly.tokenize(activationURL);

  // Let's save the auth object for usage in other files without
  // re-doing the whole authentication...
  await persist(identification);

  // Greet the user !
  console.log(`Welcome ${profile.firstName} ${profile.lastName} (${profile.email}) !`);

  // Explain the configuration.
  console.log("\nHere's the configuration of your instance:");
  console.log("- Money can get in between", configuration.moneyInMinimum, "and", configuration.moneyInMaximum);
  console.log("- Money can get out between", configuration.moneyOutMinimum, "and", configuration.moneyOutMaximum);
  console.log("- You can P2P pay between", configuration.paymentMinimum, "and", configuration.paymentMaximum);
  console.log("- You can P2P partially pay between", configuration.paymentPartMinimum, "and", configuration.paymentPartMaximum);

  // Show the current balance.
  console.log("\nYour balance is currently at", balance.value, configuration.currency);
  console.log("Your cash balance is currently at", balance.cashValue, configuration.currency);

  // A bit more of explanations on the current context.
  console.log("\nThis session", identification.sessionID, "has been saved to be reused with the keys in the 'identification' variable. You can also use this variable to make further requests.");
  console.warn("Note that there's no way to retrieve again 'identification' so make sure to store it if you need to do other requests.");

  console.log("\nAnyway, since you're in the examples, I've exported the object in a JSON file so you can run other examples without re-doing the whole authentication process !");
}());

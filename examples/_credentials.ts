import { join } from "node:path";
import { config } from "dotenv";
// Load the `.env` file configuration.
config({ path: join(__dirname, ".env") });

class ExampleCredentialsError extends Error {
  constructor() {
    super("You need to provide credentials in the `.env` file.");
    this.name = "ExampleCredentialsError";
  }
}

if (!process.env.IDENTIFIER || !process.env.SECRET) {
  throw new ExampleCredentialsError();
}

export const credentials = {
  identifier: process.env.IDENTIFIER!,
  secret: process.env.SECRET!
};

const DATABASE_IDENTIFIER_PART = /^[a-z][a-z0-9_]*$/;
const MAX_POSTGRES_IDENTIFIER_LENGTH = 63;

export const APP_ENVS = ["dev", "staging", "prod"] as const;

export type AppEnv = (typeof APP_ENVS)[number];

function readRequiredEnv(name: "APP_ENV" | "CLIENT_SLUG" | "PROJECT_SLUG") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined`);
  }

  return value;
}

export function validateDatabaseIdentifierPart(name: string, value: string) {
  if (!DATABASE_IDENTIFIER_PART.test(value)) {
    throw new Error(
      `${name} must start with a lowercase letter and contain only lowercase letters, numbers, or underscores`,
    );
  }
}

export function validateAppEnv(value: string): asserts value is AppEnv {
  if (!(APP_ENVS as readonly string[]).includes(value)) {
    throw new Error(`APP_ENV must be one of: ${APP_ENVS.join(", ")}`);
  }
}

export function getDatabaseSchemaNameFromParts({
  appEnv,
  clientSlug,
  projectSlug,
}: {
  appEnv: AppEnv;
  clientSlug: string;
  projectSlug: string;
}) {
  validateAppEnv(appEnv);
  validateDatabaseIdentifierPart("CLIENT_SLUG", clientSlug);
  validateDatabaseIdentifierPart("PROJECT_SLUG", projectSlug);

  const schemaName = `${clientSlug}_${projectSlug}_${appEnv}`;

  if (schemaName.length > MAX_POSTGRES_IDENTIFIER_LENGTH) {
    throw new Error(
      `Database schema name must be ${MAX_POSTGRES_IDENTIFIER_LENGTH} characters or fewer`,
    );
  }

  return schemaName;
}

export function getDatabaseSchemaName() {
  return getDatabaseSchemaNameFromParts({
    appEnv: readRequiredEnv("APP_ENV") as AppEnv,
    clientSlug: readRequiredEnv("CLIENT_SLUG"),
    projectSlug: readRequiredEnv("PROJECT_SLUG"),
  });
}

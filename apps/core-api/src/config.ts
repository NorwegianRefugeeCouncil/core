import { z } from 'zod';

export const ServerConfigSchema = z.object({
  isDeployed: z.boolean().default(false),
  environment: z
    .enum(['local', 'dev', 'staging', 'production'])
    .default('local'),
  server: z.object({
    port: z.coerce.number().int().positive().default(3333),
    bypassAuthentication: z.coerce.boolean().default(false),
  }),
  session: z.object({
    secret: z.string(),
  }),
  oidc: z.object({
    issuer: z.string(),
    authorizationURL: z.string(),
    tokenURL: z.string(),
    userInfoURL: z.string(),
    callbackURL: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    scope: z.string().default('openid profile'),
    scimApiToken: z.string(),
  }),
  db: z.object({
    host: z.string(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
    migrationsDir: z.string().default('./dist/libs/db/migrations'),
    seedsDir: z.string().default('./dist/libs/db/seeds'),
  }),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

let config: ServerConfig;

export const getServerConfig = (): ServerConfig => {
  if (!config) {
    config = ServerConfigSchema.parse({
      isDeployed: process.env.NODE_ENV === 'production',
      environment: process.env.ENVIRONMENT,
      server: {
        port: process.env.PORT,
        bypassAuthentication: process.env.BYPASS_AUTHENTICATION,
      },
      session: {
        secret: process.env.SESSION_SECRET,
      },
      oidc: {
        issuer: process.env.OIDC_ISSUER,
        authorizationURL: process.env.OIDC_AUTHORIZATION_URL,
        tokenURL: process.env.OIDC_TOKEN_URL,
        userInfoURL: process.env.OIDC_USER_INFO_URL,
        callbackURL: process.env.OIDC_CALLBACK_URL,
        clientId: process.env.OIDC_CLIENT_ID,
        clientSecret: process.env.OIDC_CLIENT_SECRET,
        scope: process.env.OIDC_SCOPE,
        scimApiToken: process.env.OKTA_SCIM_API_TOKEN,
      },
      db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        migrationsDir: process.env.DB_MIGRATIONS_DIR,
        seedsDir: process.env.DB_SEEDS_DIR,
      },
    });
  }
  return config;
};

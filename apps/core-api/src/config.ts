import { z } from 'zod';

export const ServerConfigSchema = z.object({
  server: z.object({
    port: z.coerce.number().int().positive().default(3333),
  }),
  oidc: z.object({
    jwksUri: z.string(),
    issuer: z.string(),
    audience: z.string(),
    scimApiToken: z.string(),
  }),
  db: z.object({
    host: z.string(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
  }),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

let config: ServerConfig;

export const getServerConfig = (): ServerConfig => {
  if (!config) {
    config = ServerConfigSchema.parse({
      server: {
        port: process.env.PORT,
      },
      oidc: {
        jwksUri: process.env.OIDC_JWKS_URI,
        issuer: process.env.OIDC_ISSUER,
        audience: process.env.OIDC_AUDIENCE,
        scimApiToken: process.env.OKTA_SCIM_API_TOKEN,
      },
      db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
    });
  }
  return config;
};

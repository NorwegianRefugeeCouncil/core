import { z } from 'zod';

export const ServerConfigSchema = z.object({
  server: z.object({
    port: z.number(),
  }),
  db: z.object({
    host: z.string(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
  }),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export const getServerConfig = (): ServerConfig =>
  ServerConfigSchema.parse({
    server: {
      port: parseInt(process.env.PORT || '3333'),
    },
    db: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
});

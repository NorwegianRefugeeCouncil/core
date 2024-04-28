import { z } from 'zod';

export enum NodeEnv {
  Production = 'production',
  Development = 'development',
  Test = 'test',
}

export enum Environment {
  Local = 'local',
  Dev = 'dev',
  Staging = 'staging',
  Production = 'production',
}

enum LogLevel {
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
  Silent = 'silent',
}

export const ServerConfigSchema = z.object({
  isRunningInProductionEnvironment: z.boolean().default(false),
  environment: z.nativeEnum(Environment).default(Environment.Local),
  logLevel: z.nativeEnum(LogLevel).default(LogLevel.Info),
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
      isRunningInProductionEnvironment:
        process.env.NODE_ENV === NodeEnv.Production,
      environment: process.env.ENVIRONMENT,
      logLevel: process.env.LOG_LEVEL,
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

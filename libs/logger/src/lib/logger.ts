import { pino, LevelWithSilentOrString } from 'pino';
import pretty from 'pino-pretty';

let logger: pino.Logger;

export const getLogger = (
  logLevel: LevelWithSilentOrString = 'info',
): pino.Logger => {
  if (!logger) {
    if (process.env.NODE_ENV === 'production') {
      logger = pino();
    } else {
      logger = pino(
        { level: logLevel },
        pretty({
          colorize: true,
        }),
      );
    }
  }
  return logger;
};

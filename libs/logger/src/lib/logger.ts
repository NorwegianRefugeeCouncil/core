import { pino } from 'pino';
import pretty from 'pino-pretty';

let logger: pino.Logger;

export const getLogger = (): pino.Logger => {
  if (!logger) {
    if (process.env.NODE_ENV === 'production') {
      logger = pino();
    } else {
      logger = pino(
        { level: 'debug' },
        pretty({
          colorize: true,
        }),
      );
    }
  }
  return logger;
};

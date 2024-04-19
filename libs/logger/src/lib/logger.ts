import { pino } from 'pino';

let logger: pino.Logger;

export const getLogger = (): pino.Logger => {
  if (!logger) {
    logger = pino();
  }
  return logger;
};

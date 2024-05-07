import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

import { getLogger } from '@nrcno/core-logger';
import {
  NotFoundError,
  formatHttpError,
  formatZodError,
} from '@nrcno/core-errors';

import { Environment, getServerConfig } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  const config = getServerConfig();
  const logger = getLogger();

  if (err instanceof ZodError) {
    res.status(400).json(formatZodError(err));
  } else if (err instanceof NotFoundError) {
    res.sendStatus(404);
    return;
  } else {
    logger.error(err);
    res
      .status(500)
      .json(formatHttpError(err, config.environment === Environment.Local));
  }
};

import { ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

import { formatHttpError, formatZodError } from '@nrcno/core-errors';

import { Environment, getServerConfig } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const config = getServerConfig();

  if (err instanceof ZodError) {
    res.status(400).json(formatZodError(err));
  } else {
    res
      .status(500)
      .json(formatHttpError(err, config.environment === Environment.Local));
  }
};

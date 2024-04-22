import { Request, Response, NextFunction } from 'express';
import { validate as isUuid } from 'uuid';

import { getLogger } from '@nrcno/core-logger';

import { getServerConfig } from '../config';

export const createScimErrorResponse = (status: number, detail: string) => {
  return {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
    status,
    detail,
  };
};

export const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  const logger = getLogger();
  logger.error('SCIM error:', error);
  const scimError = createScimErrorResponse(500, 'Internal Server Error');
  res.status(scimError.status).json(scimError);
};

export const validateUserIdParam = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!isUuid(req.params.id)) {
    const errorResponse = createScimErrorResponse(404, 'User not found');
    res.status(errorResponse.status).json(errorResponse);
  } else {
    next();
  }
};

export const authorise = (req: Request, res: Response, next: NextFunction) => {
  const {
    oidc: { scimApiToken },
  } = getServerConfig();

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const errorResponse = createScimErrorResponse(401, 'Unauthorized');
    res.status(errorResponse.status).json(errorResponse);
    return;
  }

  if (authHeader !== scimApiToken) {
    const errorResponse = createScimErrorResponse(401, 'Unauthorized');
    res.status(errorResponse.status).json(errorResponse);
    return;
  }

  next();
};

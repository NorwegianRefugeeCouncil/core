import { Router, Request, Response, NextFunction } from 'express';
import { validate as isUuid } from 'uuid';

import {
  createUser,
  getUser,
  getUserCount,
  updateUser,
  listUsers,
  searchUsers,
} from '../services/user.service';
import {
  ScimUser,
  scimUserSchema,
  scimUserAttributeSchema,
} from '../types/scim.types';
import { User } from '../models/user.model';
import { AlreadyExistsError } from '../errors';

const createScimErrorResponse = (status: number, detail: string) => {
  return {
    schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
    status,
    detail,
  };
};

const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('SCIM controller', error);
  const scimError = createScimErrorResponse(500, 'Internal Server Error');
  res.status(scimError.status).json(scimError);
};

const validateCreateUserRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = scimUserSchema.safeParse(req.body);

  if (!result.success) {
    const errorResponse = createScimErrorResponse(400, result.error.message);
    res.status(errorResponse.status).json(errorResponse);
  } else {
    req.body = result.data;
    next();
  }
};

const validateUserIdParam = (
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

const mapUserToScimUser = (user: User): ScimUser => {
  const { id, userName, firstName, lastName, displayName, emails, active } =
    user;

  const scimUser: ScimUser = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id,
    userName,
    displayName,
    active,
    emails,
  };

  if (firstName || lastName) {
    scimUser.name = {
      givenName: firstName,
      familyName: lastName,
    };
  }

  return scimUser;
};

const authorise = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const errorResponse = createScimErrorResponse(401, 'Unauthorized');
    res.status(errorResponse.status).json(errorResponse);
    return;
  }

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || token !== process.env.OKTA_SCIM_API_TOKEN) {
    const errorResponse = createScimErrorResponse(401, 'Unauthorized');
    res.status(errorResponse.status).json(errorResponse);
    return;
  }

  next();
};

const router = Router();
router.use(authorise);
router.use(errorHandlerMiddleware);

router.post('/Users', validateCreateUserRequest, async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    const scimUser = mapUserToScimUser(user);
    res.status(201).json(scimUser);
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      const errorResponse = createScimErrorResponse(
        409,
        'User already exists in the database.',
      );
      res.status(errorResponse.status).json(errorResponse);
      return;
    }
    next(error);
  }
});

router.get('/Users/:id', validateUserIdParam, async (req, res, next) => {
  try {
    const user = await getUser(req.params.id);
    if (user) {
      const scimUser = mapUserToScimUser(user);
      res.json(scimUser);
    } else {
      const errorResponse = createScimErrorResponse(404, 'User not found');
      res.status(errorResponse.status).json(errorResponse);
    }
  } catch (error) {
    next(error);
  }
});

router.put(
  '/Users/:id',
  validateUserIdParam,
  validateCreateUserRequest,
  async (req, res, next) => {
    try {
      const user = await updateUser(req.params.id, req.body);
      if (user) {
        const scimUser = mapUserToScimUser(user);
        res.json(scimUser);
      } else {
        const errorResponse = createScimErrorResponse(404, 'User not found');
        res.status(errorResponse.status).json(errorResponse);
      }
    } catch (error) {
      next(error);
    }
  },
);

router.patch('/Users/:id', validateUserIdParam, async (req, res, next) => {
  try {
    const patchOperations = req.body.Operations;

    const update = {};

    for (const operation of patchOperations) {
      // Our Okta integration should only send replace operations for the active field
      if (operation.op === 'replace' && operation.value?.active !== undefined) {
        Object.assign(update, { active: operation.value.active });
      }
    }
    if (Object.keys(update).length === 0) {
      const errorResponse = createScimErrorResponse(
        400,
        'Only replace operation for active field is supported',
      );
      res.status(errorResponse.status).json(errorResponse);
      return;
    }

    const user = await updateUser(req.params.id, update);

    if (user) {
      const scimUser = mapUserToScimUser(user);
      res.json(scimUser);
    } else {
      const errorResponse = createScimErrorResponse(404, 'User not found');
      res.status(errorResponse.status).json(errorResponse);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/Users', async (req, res, next) => {
  try {
    const startIndex = req.query.startIndex ? Number(req.query.startIndex) : 1; // SCIM uses 1-based index
    const count = req.query.count ? Number(req.query.count) : 100;
    let users: User[];
    let totalResults: number;

    if (req.query.filter) {
      const filter = String(req.query.filter);
      const [attribute, operator, value] = filter.split(' ');
      const unquotedValue = value.replace(/^"|"$/g, '');

      if (operator !== 'eq') {
        // Okta will only send eq operator, needs to be extended if we want to support other SCIM clients
        const errorResponse = createScimErrorResponse(
          501,
          'Only eq operator is supported',
        );
        res.status(errorResponse.status).json(errorResponse);
        return;
      }
      const attributeResult = scimUserAttributeSchema.safeParse(attribute);
      if (!attributeResult.success) {
        const errorResponse = createScimErrorResponse(
          400,
          attributeResult.error.message,
        );
        res.status(errorResponse.status).json(errorResponse);
        return;
      }

      users = await searchUsers(attribute, unquotedValue);
      totalResults = users.length;
    } else {
      users = await listUsers(startIndex - 1, count);
      totalResults = await getUserCount();
    }

    const scimUsers = users.map(mapUserToScimUser);
    const listResponse = {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults,
      Resources: scimUsers,
      startIndex,
      itemsPerPage: count,
    };

    res.json(listResponse);
  } catch (error) {
    next(error);
  }
});

export { router as scimRouter };

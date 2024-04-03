import { Router, Request, Response, NextFunction } from 'express';

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
  // TODO: log error
  const scimError = createScimErrorResponse(500, 'Internal Server Error');
  res.status(500).json(scimError);
};

const validateCreateUserRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = scimUserSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json(createScimErrorResponse(400, result.error.message));
  } else {
    req.body = result.data;
    next();
  }
};

const mapUserToScimUser = (user: User): ScimUser => {
  const { id, userName, firstName, lastName, emails, active } = user;

  const scimUser: ScimUser = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id,
    userName,
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

const router = Router();
router.use(errorHandlerMiddleware);

router.post('/Users', validateCreateUserRequest, async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    // TODO: if user already exists, return 409 error according to SCIM spec
    const scimUser = mapUserToScimUser(user);
    res.json(scimUser);
  } catch (error) {
    next(error);
  }
});

router.get('/Users/:id', async (req, res, next) => {
  try {
    const user = await getUser(req.params.id);
    if (user) {
      const scimUser = mapUserToScimUser(user);
      res.json(scimUser);
    } else {
      const errorResponse = createScimErrorResponse(404, 'User not found');
      res.status(404).json(errorResponse);
    }
  } catch (error) {
    next(error);
  }
});

router.put('/Users/:id', validateCreateUserRequest, async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    if (user) {
      const scimUser = mapUserToScimUser(user);
      res.json(scimUser);
    } else {
      const errorResponse = createScimErrorResponse(404, 'User not found');
      res.status(404).json(errorResponse);
    }
  } catch (error) {
    next(error);
  }
});

router.patch('/Users/:id', async (req, res, next) => {
  try {
    const patchOperations = req.body.Operations;

    const update = {};

    for (const operation of patchOperations) {
      // Only handle 'replace' operations for simplicity
      if (operation.op === 'replace') {
        Object.assign(update, operation.value); // TODO: validate inputs
      }
    }

    const user = await updateUser(req.params.id, update);

    if (user) {
      const scimUser = mapUserToScimUser(user);
      res.json(scimUser);
    } else {
      const errorResponse = createScimErrorResponse(404, 'User not found');
      res.status(404).json(errorResponse);
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
        res.status(501).json(errorResponse);
        return;
      }
      const attributeResult = scimUserAttributeSchema.safeParse(attribute);
      if (!attributeResult.success) {
        const errorResponse = createScimErrorResponse(
          400,
          attributeResult.error.message,
        );
        res.status(400).json(errorResponse);
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

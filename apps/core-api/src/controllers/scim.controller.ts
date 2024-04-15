import { Router, json } from 'express';
import { z } from 'zod';

import { User } from '@nrcno/models';

import * as UserService from '../services/user.service';
import {
  ScimUser,
  scimUserSchema,
  scimUserAttributeSchema,
  scimUserPatchSchema,
} from '../types/scim.types';
import { AlreadyExistsError } from '../errors';

import {
  authorise,
  errorHandlerMiddleware,
  validateUserIdParam,
  createScimErrorResponse,
} from './scim.middleware';

const mapUserToScimUser = (user: User): ScimUser => {
  const {
    id,
    oktaId,
    userName,
    firstName,
    lastName,
    displayName,
    emails,
    active,
  } = user;

  const scimUser: ScimUser = {
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id,
    externalId: oktaId,
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

const router = Router();
router.use(json({ type: ['application/json', 'application/scim+json'] }));
router.use(authorise);
router.use(errorHandlerMiddleware);

router.post('/Users', async (req, res, next) => {
  try {
    const validatedBody = scimUserSchema.parse(req.body);
    const user = await UserService.create(validatedBody);
    const scimUser = mapUserToScimUser(user);
    res.status(201).json(scimUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = createScimErrorResponse(400, error.message);
      res.status(errorResponse.status).json(errorResponse);
      return;
    }
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
    const user = await UserService.get(req.params.id);
    if (user) {
      const scimUser = mapUserToScimUser(user);
      res.status(200).json(scimUser);
    } else {
      const errorResponse = createScimErrorResponse(404, 'User not found');
      res.status(errorResponse.status).json(errorResponse);
    }
  } catch (error) {
    next(error);
  }
});

router.put('/Users/:id', validateUserIdParam, async (req, res, next) => {
  try {
    const validatedBody = scimUserSchema.parse(req.body);
    const user = await UserService.update(req.params.id, validatedBody);
    if (user) {
      const scimUser = mapUserToScimUser(user);
      res.status(200).json(scimUser);
    } else {
      const errorResponse = createScimErrorResponse(404, 'User not found');
      res.status(errorResponse.status).json(errorResponse);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = createScimErrorResponse(400, error.message);
      res.status(errorResponse.status).json(errorResponse);
      return;
    }
    next(error);
  }
});

router.patch('/Users/:id', validateUserIdParam, async (req, res, next) => {
  try {
    const validatedBody = scimUserPatchSchema.parse(req.body);

    // Our Okta integration should only send replace operations for the active field
    const update = validatedBody.Operations[0].value;

    const user = await UserService.update(req.params.id, update);

    if (user) {
      const scimUser = mapUserToScimUser(user);
      res.json(scimUser);
    } else {
      const errorResponse = createScimErrorResponse(404, 'User not found');
      res.status(errorResponse.status).json(errorResponse);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse = createScimErrorResponse(400, error.message);
      res.status(errorResponse.status).json(errorResponse);
    } else {
      next(error);
    }
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

      users = await UserService.search(attribute, unquotedValue);
      totalResults = users.length;
    } else {
      users = await UserService.list(startIndex - 1, count);
      totalResults = await UserService.getCount();
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

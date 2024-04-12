import exp from 'constants';

import { Request, Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';

import * as UserService from '../../services/user.service';
import { ServerConfig } from '../../config';
import { UserSchema } from '../../models/user.model';

import { checkJwt, preloadUser } from './authorisation.middleware';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

jest.mock('express-jwt', () => ({
  expressjwt: jest.fn(),
}));

jest.mock('jwks-rsa', () => ({
  expressJwtSecret: jest.fn(),
  GetVerificationKey: jest.fn(),
}));

describe('Authorization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      sendStatus: jest.fn(),
    };
  });

  describe('checkJwt', () => {
    it('should call expressjwt with correct parameters', () => {
      const config: ServerConfig = {
        oidc: {
          jwksUri: 'test_uri',
          audience: 'test_audience',
          issuer: 'test_issuer',
          scimApiToken: 'test_token',
        },
        server: {
          port: 3000,
        },
        db: {
          host: 'test_host',
          user: 'test_user',
          password: 'test_password',
          database: 'test_database',
        },
      };
      checkJwt(config);
      expect(expressjwt).toHaveBeenCalledWith({
        secret: expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: config.oidc.jwksUri,
        }),
        audience: config.oidc.audience,
        issuer: config.oidc.issuer,
        algorithms: ['RS256'],
      });
    });
  });

  describe('preloadUser', () => {
    it('should set user if auth is present', async () => {
      const user = UserSchema.parse({
        id: 'test_sub',
        oktaId: 'test',
        userName: 'test',
        firstName: 'test',
        lastName: 'test',
        displayName: 'test',
        emails: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      jest.spyOn(UserService, 'get').mockResolvedValue(user);

      mockRequest.auth = { sub: 'test_sub' };

      await preloadUser(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(UserService.get).toHaveBeenCalledWith('test_sub');
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user).toEqual(user);
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should send 401 if auth is not present', () => {
      preloadUser(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should send 401 if user is not found', async () => {
      jest.spyOn(UserService, 'get').mockResolvedValue(null);

      mockRequest.auth = { sub: 'test_sub' };

      await preloadUser(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(UserService.get).toHaveBeenCalledWith('test_sub');
      expect(mockRequest.user).toBeUndefined();
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});

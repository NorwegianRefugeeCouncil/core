import * as fs from 'fs';

import {
  OpenFgaClient,
  TupleKey,
  WriteAuthorizationModelRequest,
} from '@openfga/sdk';
import { friendlySyntaxToApiSyntax } from '@openfga/syntax-transformer';

import {
  Team,
  Position,
  TeamPartialUpdate,
  PositionPartialUpdate,
  User,
  Roles,
} from '@nrcno/core-models';

let authorisationClient: AuthorisationClient;

export const getAuthorisationClient = (apiUrl?: string) => {
  if (!authorisationClient) {
    if (!apiUrl)
      throw new Error(
        'API URL is required to create a new AuthorisationClient',
      );
    authorisationClient = new AuthorisationClient(apiUrl);
  }

  return authorisationClient;
};

export class AuthorisationClient {
  private client: OpenFgaClient | undefined;
  private apiUrl: string;

  private readonly storeName = 'core-tenant';
  private storeId = '';
  private authorizationModelId = '';

  private teamClient: TeamClient | undefined;
  private positionClient: PositionClient | undefined;
  private userClient: UserClient | undefined;
  private roleClient: RoleClient | undefined;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  get team() {
    if (!this.teamClient) throw new Error('Client not initialised');
    return this.teamClient;
  }

  get position() {
    if (!this.positionClient) throw new Error('Client not initialised');
    return this.positionClient;
  }

  get user() {
    if (!this.userClient) throw new Error('Client not initialised');
    return this.userClient;
  }

  get role() {
    if (!this.roleClient) throw new Error('Client not initialised');
    return this.roleClient;
  }

  public init = async () => {
    this.initClient();
    await this.putStore();
    await this.putModel();
    await this.initClients();
  };

  private initClient = () => {
    this.client = new OpenFgaClient({
      apiUrl: this.apiUrl,
      storeId: this.storeId.length > 0 ? this.storeId : undefined,
      authorizationModelId:
        this.authorizationModelId.length > 0
          ? this.authorizationModelId
          : undefined,
    });
  };

  private initClients = async () => {
    if (
      !this.client ||
      this.storeId.length === 0 ||
      this.authorizationModelId.length === 0
    )
      throw new Error('Client not initialised');

    this.teamClient = new TeamClient(this.client);
    this.positionClient = new PositionClient(this.client);
    this.userClient = new UserClient(this.client);
    this.roleClient = new RoleClient(this.client);
  };

  private putStore = async () => {
    if (!this.client) throw new Error('Client not initialised');

    const stores = await this.client.listStores();
    const store = stores.stores.find((store) => store.name === this.storeName);

    if (store) {
      this.storeId = store.id;
    } else {
      const response = await this.client.createStore({
        name: this.storeName,
      });
      this.storeId = response.id;
    }

    this.initClient();
  };

  private putModel = async () => {
    if (!this.client || this.storeId.length === 0)
      throw new Error('Client not initialised');

    const modelDSL = fs.readFileSync('./store.fga.yaml', 'utf-8');
    const modelJSON = friendlySyntaxToApiSyntax(
      modelDSL,
    ) as WriteAuthorizationModelRequest;

    const response = await this.client.readLatestAuthorizationModel();

    if (response.authorization_model) {
      const { id, ...latestModel } = response.authorization_model;
      if (JSON.stringify(latestModel) !== JSON.stringify(modelJSON)) {
        const res = await this.client.writeAuthorizationModel(modelJSON);
        this.authorizationModelId = res.authorization_model_id;
      } else {
        this.authorizationModelId = id;
      }
    } else {
      const res = await this.client.writeAuthorizationModel(modelJSON);
      this.authorizationModelId = res.authorization_model_id;
    }
  };
}

class RoleClient {
  private client: OpenFgaClient;

  constructor(client: OpenFgaClient) {
    this.client = client;
  }

  check = async (userId: string, role: string) => {
    const result = await this.client.check({
      user: `user:${userId}`,
      relation: role,
      object: 'organisation:nrc',
    });
    return Boolean(result.allowed);
  };
}

class TeamClient {
  private client: OpenFgaClient;

  constructor(client: OpenFgaClient) {
    this.client = client;
  }

  create = async (team: Team) => {
    await this.client.writeTuples([
      ...team.positions.map<TupleKey>((position) => ({
        user: `position:${position.id}`,
        relation: 'position',
        object: `team:${team.id}`,
      })),
      ...Object.entries(team.roles)
        .filter(([_, enabled]) => enabled)
        .map<TupleKey>(([role, _]) => ({
          user: `team:${team.id}#member`,
          relation: role,
          object: 'organisation:nrc',
        })),
    ]);
  };

  update = async (teamId: string, team: TeamPartialUpdate) => {
    await this.client.write({
      writes: [
        ...team.positions.add.map<TupleKey>((position) => ({
          user: `position:${position}`,
          relation: 'position',
          object: `team:${teamId}`,
        })),
        ...team.roles.add.map<TupleKey>((role) => ({
          user: `team:${teamId}#member`,
          relation: role,
          object: 'organisation:nrc',
        })),
      ],
      deletes: [
        ...team.positions.remove.map<TupleKey>((position) => ({
          user: `position:${position}`,
          relation: 'position',
          object: `team:${teamId}`,
        })),
        ...team.roles.remove.map<TupleKey>((role) => ({
          user: `team:${teamId}#member`,
          relation: role,
          object: 'organisation:nrc',
        })),
      ],
    });
  };

  delete = async (teamId: string) => {
    const roleTuples = (
      await Promise.all(
        Object.values(Roles).map<Promise<TupleKey | null>>(async (role) => {
          const orgObjects = await this.client.listObjects({
            user: `team:${teamId}#member`,
            relation: role,
            type: 'organisation',
          });

          if (orgObjects.objects.length > 1)
            throw new Error(
              `Team ${teamId} has multiple organisations with role ${role}. Only one organisation is allowed.`,
            );

          if (orgObjects.objects.length === 1) {
            return {
              user: `team:${teamId}#member`,
              relation: role,
              object: orgObjects.objects[0],
            };
          }

          return null;
        }),
      )
    ).filter((tuple) => tuple !== null) as TupleKey[];

    const positionTuples = (
      await this.client.listUsers({
        object: {
          type: 'team',
          id: teamId,
        },
        relation: 'position',
        user_filters: [{ type: 'position' }],
      })
    ).users.map<TupleKey>((user) => ({
      user: `${user.object?.type}:${user.object?.id}`,
      relation: 'position',
      object: `team:${teamId}`,
    }));

    await this.client.deleteTuples([...roleTuples, ...positionTuples]);
  };
}

class PositionClient {
  private client: OpenFgaClient;

  constructor(client: OpenFgaClient) {
    this.client = client;
  }

  create = async (position: Position) => {
    await this.client.writeTuples([
      ...position.staff.map<TupleKey>((userId) => ({
        user: `user:${userId}`,
        relation: 'staff',
        object: `position:${position.id}`,
      })),
      ...Object.entries(position.roles)
        .filter(([_, enabled]) => enabled)
        .map<TupleKey>(([role, _]) => ({
          user: `position:${position.id}#staff`,
          relation: role,
          object: 'organisation:nrc',
        })),
    ]);
  };

  update = async (positionId: string, position: PositionPartialUpdate) => {
    await this.client.write({
      writes: [
        ...position.staff.add.map<TupleKey>((userId) => ({
          user: `user:${userId}`,
          relation: 'staff',
          object: `position:${positionId}`,
        })),
        ...position.roles.add.map<TupleKey>((role) => ({
          user: `position:${positionId}#staff`,
          relation: role,
          object: 'organisation:nrc',
        })),
      ],
      deletes: [
        ...position.staff.remove.map<TupleKey>((userId) => ({
          user: `user:${userId}`,
          relation: 'staff',
          object: `position:${positionId}`,
        })),
        ...position.roles.remove.map<TupleKey>((role) => ({
          user: `position:${positionId}#staff`,
          relation: role,
          object: 'organisation:nrc',
        })),
      ],
    });
  };

  delete = async (positionId: string) => {
    const teamTuples = (
      await this.client.listObjects({
        user: `position:${positionId}`,
        relation: 'position',
        type: 'team',
      })
    ).objects.map<TupleKey>((teamId) => ({
      user: `position:${positionId}`,
      relation: 'position',
      object: `team:${teamId}`,
    }));

    const staffTuples = (
      await this.client.listUsers({
        object: {
          type: 'position',
          id: positionId,
        },
        relation: 'staff',
        user_filters: [{ type: 'user' }],
      })
    ).users.map<TupleKey>((user) => ({
      user: `user:${user.object?.id}`,
      relation: 'staff',
      object: `position:${positionId}`,
    }));

    await this.client.deleteTuples([...teamTuples, ...staffTuples]);
  };
}

class UserClient {
  private client: OpenFgaClient;

  constructor(client: OpenFgaClient) {
    this.client = client;
  }

  delete = async (user: User) => {};
}

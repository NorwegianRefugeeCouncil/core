import { TeamClient } from '@nrcno/core-clients';
import {
  Team,
  TeamDefinition,
  TeamListItem,
  TeamPartialUpdate,
} from '@nrcno/core-models';

import {
  CRUDState,
  defaultCRUDState,
  useCRUDResource,
} from './useCRUDResource.hook';

export type TeamState = CRUDState<
  Team,
  TeamListItem,
  TeamDefinition,
  TeamPartialUpdate
>;
export const useTeam = (client: TeamClient) =>
  useCRUDResource<
    Team,
    TeamListItem,
    TeamDefinition,
    TeamPartialUpdate,
    TeamClient
  >(client);
export const defaultTeamState = defaultCRUDState;

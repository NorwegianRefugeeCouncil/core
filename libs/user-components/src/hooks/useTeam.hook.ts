import { TeamClient } from '@nrcno/core-clients';
import {
  Team,
  TeamDefinition,
  TeamListItem,
  TeamUpdate,
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
  TeamUpdate
>;
export const useTeam = (client: TeamClient) =>
  useCRUDResource<Team, TeamListItem, TeamDefinition, TeamUpdate, TeamClient>(
    client,
  );
export const defaultTeamState = defaultCRUDState;

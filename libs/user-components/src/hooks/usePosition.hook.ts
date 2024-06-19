import { PositionClient } from '@nrcno/core-clients';
import {
  Position,
  PositionDefinition,
  PositionListItem,
  PositionUpdate,
} from '@nrcno/core-models';

import {
  CRUDState,
  defaultCRUDState,
  useCRUDResource,
} from './useCRUDResource.hook';

export type PositionState = CRUDState<
  Position,
  PositionListItem,
  PositionDefinition,
  PositionUpdate
>;
export const usePosition = (client: PositionClient) =>
  useCRUDResource<
    Position,
    PositionListItem,
    PositionDefinition,
    PositionUpdate,
    PositionClient
  >(client);
export const defaultPositionState = defaultCRUDState;

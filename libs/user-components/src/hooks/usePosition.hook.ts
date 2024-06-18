import { PositionClient } from '@nrcno/core-clients';
import {
  Position,
  PositionDefinition,
  PositionListItem,
  PositionPartialUpdate,
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
  PositionPartialUpdate
>;
export const usePosition = (client: PositionClient) =>
  useCRUDResource<
    Position,
    PositionListItem,
    PositionDefinition,
    PositionPartialUpdate,
    typeof PositionClient
  >(client);
export const defaultPositionState = defaultCRUDState;

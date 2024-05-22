import { z } from 'zod';

import {
  ParticipantDefinitionSchema,
  ParticipantSchema,
  ParticipantUpdateSchema,
  ParticipantDefinition,
  ParticipantListItemSchema,
  ParticipantListItem,
  ParticipantFilteringSchema,
  ParticipantListSortingFields,
  ParticipantFiltering,
  Participant,
  ParticipantPartialUpdate,
  ParticipantUpdate,
} from './participant.model';

export enum EntityType {
  Participant = 'participants',
}

export const EntityTypeSchema = z.nativeEnum(EntityType);

export const EntityIdSchema = z.string().ulid();

export type Entity = Participant;
export type EntityDefinition = ParticipantDefinition;
export type EntityListItem = ParticipantListItem;
export type EntityUpdate = ParticipantUpdate;
export type EntityPartialUpdate = ParticipantPartialUpdate;
export type EntityFiltering = ParticipantFiltering;

const entitySchemaMap = {
  [EntityType.Participant]: ParticipantSchema,
};
export const getEntitySchema = (entityType: EntityType) =>
  entitySchemaMap[entityType];

const entityDefinitionSchemaMap = {
  [EntityType.Participant]: ParticipantDefinitionSchema,
};
export const getEntityDefinitionSchema = (entityType: EntityType) =>
  entityDefinitionSchemaMap[entityType];

const entityUpdateSchemaMap = {
  [EntityType.Participant]: ParticipantUpdateSchema,
};
export const getEntityUpdateSchema = (entityType: EntityType) =>
  entityUpdateSchemaMap[entityType];

const entityListItemSchemaMap = {
  [EntityType.Participant]: ParticipantListItemSchema,
};
export const getEntityListItemSchema = (entityType: EntityType) =>
  entityListItemSchemaMap[entityType];

const entityListSortingFieldsMap = {
  [EntityType.Participant]: ParticipantListSortingFields,
};
export const getEntityListSortingFields = (entityType: EntityType) =>
  entityListSortingFieldsMap[entityType];

const entityFilteringSchemaMap = {
  [EntityType.Participant]: ParticipantFilteringSchema,
};
export const getEntityFilteringSchema = (entityType: EntityType) =>
  entityFilteringSchemaMap[entityType];

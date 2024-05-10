import { z } from 'zod';

import {
  ParticipantDefinitionSchema,
  ParticipantSchema,
  ParticipantUpdateSchema,
  ParticipantDefinition,
  ParticipantListItemFieldSchema,
  ParticipantListItemSchema,
} from './participant.model';

export enum EntityType {
  Participant = 'participants',
}

export const EntityTypeSchema = z.nativeEnum(EntityType);

export const EntityIdSchema = z.string().ulid();

// export const EntitySchema = z.union([ParticipantSchema]);
export const EntitySchema = ParticipantSchema;
export type Entity = z.infer<typeof EntitySchema>;

export type EntityDefinition = ParticipantDefinition;

export const EntityFieldSchema = EntitySchema.keyof();
export type EntityField = z.infer<typeof EntityFieldSchema>;

export const EntityListItemFieldSchema = ParticipantListItemFieldSchema;
export type EntityListItemField = z.infer<typeof EntityListItemFieldSchema>;

export const EntityListItemSchema = ParticipantListItemSchema;
export type EntityListItem = z.infer<typeof EntityListItemSchema>;

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

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
import {
  Language,
  LanguageFilter,
  LanguageFilterSchema,
  LanguageSchema,
  LanguageSortingFields,
} from './language.model';

export enum EntityType {
  Participant = 'participants',
  Language = 'languages',
}

export const EntityTypeSchema = z.nativeEnum(EntityType);

export const EntityIdSchema = z.string().ulid();

export const EmptyFilterSchema = z.object({});
export type EmptyFilter = z.infer<typeof EmptyFilterSchema>;

export type Entity = Participant | Language;
export type EntityDefinition = ParticipantDefinition;
export type EntityListItem = ParticipantListItem | Language;
export type EntityUpdate = ParticipantUpdate;
export type EntityPartialUpdate = ParticipantPartialUpdate;
export type EntityFiltering =
  | ParticipantFiltering
  | LanguageFilter
  | EmptyFilter;

export const getEntitySchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Participant:
      return ParticipantSchema;
    case EntityType.Language:
      return LanguageSchema;
    default:
      throw new Error(`No schema found for ${entityType}`);
  }
};

export const getEntityDefinitionSchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Participant:
      return ParticipantDefinitionSchema;
    default:
      throw new Error(`No definition schema found for ${entityType}`);
  }
};

export const getEntityUpdateSchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Participant:
      return ParticipantUpdateSchema;
    default:
      throw new Error(`No update schema found for ${entityType}`);
  }
};

export const getEntityListItemSchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Participant:
      return ParticipantListItemSchema;
    case EntityType.Language:
      return LanguageSchema;
    default:
      throw new Error(`No list item schema found for ${entityType}`);
  }
};

export const getEntityListSortingFields = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Participant:
      return ParticipantListSortingFields;
    case EntityType.Language:
      return LanguageSortingFields;
    default:
      return [];
  }
};

export const getEntityFilteringSchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Participant:
      return ParticipantFilteringSchema;
    case EntityType.Language:
      return LanguageFilterSchema;
    default:
      return EmptyFilterSchema;
  }
};

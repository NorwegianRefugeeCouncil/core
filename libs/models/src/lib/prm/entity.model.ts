import { z } from 'zod';

import {
  IndividualDefinitionSchema,
  IndividualSchema,
  IndividualUpdateSchema,
  IndividualDefinition,
  IndividualListItemSchema,
  IndividualListItem,
  IndividualFilteringSchema,
  IndividualListSortingFields,
  IndividualFiltering,
  Individual,
  IndividualPartialUpdate,
  IndividualUpdate,
  IndividualDefaultSorting,
} from './individual.model';
import {
  Language,
  LanguageDefaultSorting,
  LanguageFilter,
  LanguageFilterSchema,
  LanguageSchema,
  LanguageSortingFields,
} from './language.model';
import {
  Nationality,
  NationalityDefaultSorting,
  NationalityFilter,
  NationalityFilterSchema,
  NationalitySchema,
  NationalitySortingFields,
} from './nationality.model';

export enum EntityType {
  Individual = 'individuals',
  Language = 'languages',
  Nationality = 'nationalities',
}

export const EntityTypeSchema = z.nativeEnum(EntityType);

export const EntityIdSchema = z.string().ulid();

export const EmptyFilterSchema = z.object({});
export type EmptyFilter = z.infer<typeof EmptyFilterSchema>;

export type Entity = Individual | Language | Nationality;
export type EntityDefinition = IndividualDefinition;
export type EntityListItem = IndividualListItem | Language | Nationality;
export type EntityUpdate = IndividualUpdate;
export type EntityPartialUpdate = IndividualPartialUpdate;
export type EntityFiltering =
  | IndividualFiltering
  | LanguageFilter
  | NationalityFilter
  | EmptyFilter;

export const getEntitySchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Individual:
      return IndividualSchema;
    case EntityType.Language:
      return LanguageSchema;
    case EntityType.Nationality:
      return NationalitySchema;
    default:
      throw new Error(`No schema found for ${entityType}`);
  }
};

export const getEntityDefinitionSchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Individual:
      return IndividualDefinitionSchema;
    default:
      throw new Error(`No definition schema found for ${entityType}`);
  }
};

export const getEntityUpdateSchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Individual:
      return IndividualUpdateSchema;
    default:
      throw new Error(`No update schema found for ${entityType}`);
  }
};

export const getEntityListItemSchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Individual:
      return IndividualListItemSchema;
    case EntityType.Language:
      return LanguageSchema;
    case EntityType.Nationality:
      return NationalitySchema;
    default:
      throw new Error(`No list item schema found for ${entityType}`);
  }
};

export const getEntityListSortingFields = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Individual:
      return IndividualListSortingFields;
    case EntityType.Language:
      return LanguageSortingFields;
    case EntityType.Nationality:
      return NationalitySortingFields;
    default:
      return [];
  }
};

export const getEntityDefaultSorting = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Individual:
      return IndividualDefaultSorting;
    case EntityType.Language:
      return LanguageDefaultSorting;
    case EntityType.Nationality:
      return NationalityDefaultSorting;
    default:
      throw new Error(`No default sorting found for ${entityType}`);
  }
};

export const getEntityFilteringSchema = (entityType: EntityType) => {
  switch (entityType) {
    case EntityType.Individual:
      return IndividualFilteringSchema;
    case EntityType.Language:
      return LanguageFilterSchema;
    case EntityType.Nationality:
      return NationalityFilterSchema;
    default:
      return EmptyFilterSchema;
  }
};
